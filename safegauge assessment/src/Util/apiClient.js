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
        }
    }
}