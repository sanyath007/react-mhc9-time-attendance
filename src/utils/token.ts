import { jwtDecode } from "jwt-decode";
import moment from "moment";
import { TokenDecoded } from "../lib/types";

export function verifyToken (token: string) {
    const decoded: TokenDecoded = jwtDecode(token || '');
    const currentTime = Math.floor(Date.now() / 1000);

    return decoded.exp > currentTime;
}