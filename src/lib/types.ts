export type AttendanceFilters = {
    toDay: string
}

export type HeaderIconProps = {
    Icon: any;
    cssClass?: string;
}

export type TokenDecoded = {
    exp: number;
    sub: string;
    iat: number;
}