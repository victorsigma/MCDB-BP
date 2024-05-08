import { Player } from "@minecraft/server";
import { HttpRequest, HttpHeader, HttpRequestMethod, http } from '@minecraft/server-net';
import { isJSON, querySplits } from "./databaseUtils";
import { INVALID_QUERY } from "./commonResponses";
import { select } from "./dqlQuerys";
import { shell } from "./bedrockSystem";
import { Token, User } from "../models/user";

/**
 * @param {string} query 
 * @param {Player} player
 * @returns 
 */
export const login = async (query, player) => {
    const querySplit = querySplits(query);

    if(querySplit.length < 2) return INVALID_QUERY;
    if(!isJSON(querySplit[1])) return INVALID_QUERY;

    const infomation = JSON.parse(querySplit[1]);
    if(!infomation.user) return INVALID_QUERY;

    const querySelect = `&select security user_authentication {"user": "${infomation.user}"}`;
    const result = select(querySelect, player);
    if(!isJSON(result)) return result;

    const body = {};

    body.userSelect = JSON.parse(result)[0];
    body.userQuery = infomation;

    const response = await postLogin(body);

    if(response.message != undefined) return `§4${response.message}`;


    player.addTag(`token:${response.token}`);

    return '§eSuccessful'
}


/**
 * Envia la peticion de login al back-end
 * @param {*} body
 * @returns {Promise<Token>}
 */
const postLogin = async (body) => {
    const req = new HttpRequest('http://localhost:3000/api/security/login');

    
    req.method = HttpRequestMethod.Post;

    req.body = JSON.stringify(body);

    req.headers = [
        new HttpHeader('Content-Type', 'application/json'),
    ];

    const response = await http.request(req);
    return JSON.parse(response.body);
}