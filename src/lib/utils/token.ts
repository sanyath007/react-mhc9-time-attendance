import { jwtDecode } from "jwt-decode";
import { type TokenDecoded } from "../types";

export function verifyToken(token: string) {
    const decoded: TokenDecoded = jwtDecode(token || '');

    return decoded.exp < Date.now();
}