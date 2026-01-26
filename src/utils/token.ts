import { jwtDecode } from "jwt-decode";
import moment from "moment";
import { TokenDecoded } from "../lib/types";

export function verifyToken (token: string) {
    const decoded: TokenDecoded = jwtDecode(token || '');

    return decoded.exp < Date.now();
}