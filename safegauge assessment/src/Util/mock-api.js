/*! SafeGauge Portal API SDK v2.0.0 (mock harness) | (c) SafeGauge Pty Ltd | MIT
 * Simulates the SafeGauge cloud-portal REST API entirely in the browser.
 * No server, no network. State persists to localStorage. Import and use as-is; do NOT modify.
 *
 *   import { Api } from './mock-api.js';   // also attaches to globalThis.Api
 *
 * Every call returns a Promise, resolves after simulated network latency (~150-600ms),
 * and may occasionally reject with a transient error (see "Errors"). Write real
 * loading / error / retry handling — flaky calls are intentional.
 *
 * ── Auth ────────────────────────────────────────────────────────────────────
 *   Api.login(username, password, { rememberMe })  -> { token, user }
 *       Seeded users below. `rememberMe` extends the session. Rejects 401 on bad creds.
 *   Api.me(token)            -> { id, username, role }   // rejects 401 if token missing/expired
 *   Api.logout(token)        -> { ok: true }
 *
 *   Seeded users:  admin / safegauge   (role: 'admin')
 *                  viewer / readonly   (role: 'viewer'   — CRUD writes rejected 403)
 *
 * ── Devices (CRUD) ──────────────────────────────────────────────────────────
 *   Api.devices.list(token)                    -> Device[]
 *   Api.devices.get(token, id)                 -> Device
 *   Api.devices.create(token, body)            -> Device      // body: { name, site, sensorCount }
 *   Api.devices.update(token, id, patch)       -> Device
 *   Api.devices.remove(token, id)              -> { ok: true }  // cascades: deletes its rules
 *
 *   Device = { id, name, site, sensorCount, firmwareVersion, createdAt }
 *
 * ── Alert Rules (CRUD) ──────────────────────────────────────────────────────
 *   Api.rules.list(token, deviceId?)           -> Rule[]      // omit deviceId for all rules
 *   Api.rules.create(token, body)              -> Rule        // body: { deviceId, sensorId, op, threshold, severity }
 *   Api.rules.update(token, id, patch)         -> Rule
 *   Api.rules.remove(token, id)                -> { ok: true }
 *   Api.rules.bulkCreate(token, rules[])       -> Rule[]      // convenience: create many in one call
 *
 *   Rule = { id, deviceId, sensorId, op:'>'|'<', threshold:Number, severity:'warn'|'critical' }
 *
 * ── Severity display convention (SafeGauge design system) ───────────────────
 *   Breaching tiles on the live dashboard are themed by severity:
 *     severity 'critical'  → violet  #7c3aed
 *     severity 'warn'      → red     #dc2626
 *
 * ── Errors (all rejects are Error with a numeric .status) ────────────────────
 *   401  missing / invalid / expired token         -> send the user back to login
 *   403  authenticated but not allowed (viewer write)
 *   404  no such id
 *   422  validation failed (.body lists field errors)
 *   500  transient server error (~8% of calls)      -> safe to retry
 *
 * ── Testing helpers ─────────────────────────────────────────────────────────
 *   Api._reset()             restores seeded state + clears tokens (call in test setup)
 *   Api._setFailRate(rate)   set the transient-500 probability (0..1). Pass 0 to make
 *                            integration tests deterministic. _reset() restores the default (0.08).
 */
(function (g) {
  "use strict";

  var LS_KEY = "sg_portal_state_v2";
  var LATENCY_MIN = 150, LATENCY_MAX = 600, DEFAULT_FAIL_RATE = 0.08;
  var failRate = DEFAULT_FAIL_RATE;

  // ── deterministic-ish id + rng (not crypto; fine for a mock) ──
  var _seq = 1;
  function uid(prefix) { return prefix + "_" + (_seq++).toString(36) + Math.floor(Math.random() * 1e6).toString(36); }

  function seed() {
    return {
      devices: [
        { id: "dev_hydra", name: "Hydra Test Rig", site: "Newcastle Bay 3", sensorCount: 12, createdAt: 1_720_000_000_000 },
        { id: "dev_press", name: "Press Line A", site: "Sydney Plant", sensorCount: 8, createdAt: 1_721_000_000_000 }
      ],
      rules: [
        { id: "rule_1", deviceId: "dev_hydra", sensorId: "PT-01", op: ">", threshold: 5000, severity: "critical" },
        { id: "rule_2", deviceId: "dev_hydra", sensorId: "TT-02", op: ">", threshold: 80, severity: "warn" }
      ]
    };
  }

  // ── persistence ──
  function load() {
    try {
      var raw = g.localStorage && g.localStorage.getItem(LS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    var s = seed();
    save(s);
    return s;
  }
  function save(s) {
    try { g.localStorage && g.localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch (e) { /* ignore */ }
  }

  var state = load();
  var tokens = {}; // token -> { username, role, exp }

  // ── plumbing ──
  function err(status, message, body) {
    var e = new Error(message || ("HTTP " + status));
    e.status = status;
    if (body) e.body = body;
    return e;
  }

  function net() {
    // resolves after latency; ~FAIL_RATE of calls throw a transient 500 first
    return new Promise(function (resolve, reject) {
      var ms = LATENCY_MIN + Math.floor(Math.random() * (LATENCY_MAX - LATENCY_MIN));
      setTimeout(function () {
        if (Math.random() < failRate) reject(err(500, "Transient upstream error — retry"));
        else resolve();
      }, ms);
    });
  }

  function auth(token, opts) {
    // returns the session or throws 401/403
    var s = tokens[token];
    if (!s || s.exp < Date.now()) throw err(401, "Invalid or expired token");
    if (opts && opts.write && s.role !== "admin") throw err(403, "Read-only account cannot modify data");
    return s;
  }

  function persist() { save(state); }

  // ── users ──
  var USERS = { admin: { password: "safegauge", role: "admin" }, viewer: { password: "readonly", role: "viewer" } };

  // ── validators ──
  function validateDevice(body) {
    var errors = {};
    if (!body || typeof body.name !== "string" || !body.name.trim()) errors.name = "Name is required";
    if (!body || typeof body.site !== "string" || !body.site.trim()) errors.site = "Site is required";
    if (!body || !(body.sensorCount >= 1 && body.sensorCount <= 12)) errors.sensorCount = "sensorCount must be 1–12";
    return Object.keys(errors).length ? errors : null;
  }
  function validateRule(body) {
    var errors = {};
    if (!body || typeof body.sensorId !== "string" || !/^(PT|TT)-\d{2}$/.test(body.sensorId)) errors.sensorId = "sensorId like PT-01 / TT-02";
    if (!body || (body.op !== ">" && body.op !== "<")) errors.op = "op must be '>' or '<'";
    if (!body || typeof body.threshold !== "number" || isNaN(body.threshold)) errors.threshold = "threshold must be a number";
    if (!body || (body.severity !== "warn" && body.severity !== "critical")) errors.severity = "severity must be 'warn' or 'critical'";
    if (!body || !body.deviceId) errors.deviceId = "deviceId is required";
    return Object.keys(errors).length ? errors : null;
  }

  // ── API ──
  var Api = {
    login: function (username, password) {
      return net().then(function () {
        var u = USERS[username];
        if (!u || u.password !== password) throw err(401, "Invalid username or password");
        var token = uid("tok");
        tokens[token] = { username: username, role: u.role, exp: Date.now() + 30 * 60 * 1000 };
        return { token: token, user: { id: "user_" + username, username: username, role: u.role } };
      });
    },
    me: function (token) {
      return net().then(function () {
        var s = auth(token);
        return { id: "user_" + s.username, username: s.username, role: s.role };
      });
    },
    logout: function (token) {
      return net().then(function () { delete tokens[token]; return { ok: true }; });
    },

    devices: {
      list: function (token) {
        return net().then(function () { auth(token); return state.devices.slice(); });
      },
      get: function (token, id) {
        return net().then(function () {
          auth(token);
          var d = state.devices.find(function (x) { return x.id === id; });
          if (!d) throw err(404, "Device not found");
          return Object.assign({}, d);
        });
      },
      create: function (token, body) {
        return net().then(function () {
          auth(token, { write: true });
          var e = validateDevice(body);
          if (e) throw err(422, "Validation failed", e);
          var d = { id: uid("dev"), name: body.name.trim(), site: body.site.trim(), sensorCount: body.sensorCount, createdAt: Date.now() };
          state.devices = state.devices.concat([d]);
          persist();
          return Object.assign({}, d);
        });
      },
      update: function (token, id, patch) {
        return net().then(function () {
          auth(token, { write: true });
          var idx = state.devices.findIndex(function (x) { return x.id === id; });
          if (idx < 0) throw err(404, "Device not found");
          var merged = Object.assign({}, state.devices[idx], patch, { id: id });
          var e = validateDevice(merged);
          if (e) throw err(422, "Validation failed", e);
          state.devices = state.devices.map(function (x, i) { return i === idx ? merged : x; });
          persist();
          return Object.assign({}, merged);
        });
      },
      remove: function (token, id) {
        return net().then(function () {
          auth(token, { write: true });
          if (!state.devices.some(function (x) { return x.id === id; })) throw err(404, "Device not found");
          state.devices = state.devices.filter(function (x) { return x.id !== id; });
          state.rules = state.rules.filter(function (r) { return r.deviceId !== id; }); // cascade
          persist();
          return { ok: true };
        });
      }
    },

    rules: {
      list: function (token, deviceId) {
        return net().then(function () {
          auth(token);
          var out = state.rules.slice();
          if (deviceId) out = out.filter(function (r) { return r.deviceId === deviceId; });
          return out;
        });
      },
      create: function (token, body) {
        return net().then(function () {
          auth(token, { write: true });
          var e = validateRule(body);
          if (e) throw err(422, "Validation failed", e);
          var r = { id: uid("rule"), deviceId: body.deviceId, sensorId: body.sensorId, op: body.op, threshold: body.threshold, severity: body.severity };
          state.rules = state.rules.concat([r]);
          persist();
          return Object.assign({}, r);
        });
      },
      update: function (token, id, patch) {
        return net().then(function () {
          auth(token, { write: true });
          var idx = state.rules.findIndex(function (x) { return x.id === id; });
          if (idx < 0) throw err(404, "Rule not found");
          var merged = Object.assign({}, state.rules[idx], patch, { id: id });
          var e = validateRule(merged);
          if (e) throw err(422, "Validation failed", e);
          state.rules = state.rules.map(function (x, i) { return i === idx ? merged : x; });
          persist();
          return Object.assign({}, merged);
        });
      },
      remove: function (token, id) {
        return net().then(function () {
          auth(token, { write: true });
          if (!state.rules.some(function (x) { return x.id === id; })) throw err(404, "Rule not found");
          state.rules = state.rules.filter(function (x) { return x.id !== id; });
          persist();
          return { ok: true };
        });
      }
    },

    _reset: function () {
      state = seed();
      tokens = {};
      failRate = DEFAULT_FAIL_RATE;
      save(state);
    },
    _setFailRate: function (rate) {
      failRate = (typeof rate === "number" && rate >= 0 && rate <= 1) ? rate : DEFAULT_FAIL_RATE;
    }
  };

  g.Api = Api;
  if (typeof module !== "undefined" && module.exports) module.exports = { Api: Api };
})(typeof window !== "undefined" ? window : globalThis);

export const Api = (typeof window !== "undefined" ? window : globalThis).Api;
