import { Api } from './mock-api.js'
let onUnauthorized = () => {}; 

export function registerUnauthorizedHandler(fn) 
{ onUnauthorized = fn; }

export const api = 
{
    devices: {
        list: async (token) =>{
            try{
                return await Api.devices.list(token);
            }
            catch (error) {
                if (error.status === 401) {
                    onUnauthorized();
                }
                throw error;
            }
        },

        get: async(token, id) => {
            try {
                return await Api.devices.get(token, id);
            } catch (error) {
                if (error.status === 401) onUnauthorized();
                throw error;
            }
        },

        create: async (token, body) => {
            try {
                return await Api.devices.create(token, body);
            } catch (error) {
                if (error.status === 401) onUnauthorized();
                throw error;
            }
        },

        update: async (token, id, patch) => {
            try {
                return await Api.devices.update(token, id, patch);
            } catch (error) {
                if (error.status === 401) onUnauthorized();
                throw error;
            }
        },

        remove: async (token, id) => {
            try {
                return await Api.devices.remove(token, id);
            } catch (error) {
                if (error.status === 401) onUnauthorized();
                throw error;
            }
        },
    },
};