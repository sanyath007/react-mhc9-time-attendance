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

/** Employee */
export type Employee = {
    id: number;
    prefix: EmployeePrefix;
    firstname: string;
    lastname: string;
    avatar_url?: string;
    status: number;
    position: EmployeePosition;
    level: EmployeeLevel;
    face_descriptor?: string;
    address_no?: string;
    tel?: string;
    email?: string;
    changwat?: any;
    amphur?: any;
    tambon?: any;
    zipcode?: string;
}

export type EmployeePrefix = {
    id: number;
    name: string
}

export type EmployeePosition = {
    id: number;
    name: string;
}

export type EmployeeLevel = {
    id: number;
    name: string;
}

export type EmployeePositionProps = {
    position: EmployeePosition;
    level: EmployeeLevel;
}
/** Employee */

export type Location = {
    latitude: number;
    longitude: number;
    accuracy: number;
    speed: number | null;
}

/** Face Recognition */
export type DetectedEmployee = {
    id: string;
    name?: string;
    position?: string;
    confidence?: number;
};

export type CapturedImage = {
    image: any;
    descriptor: any;
    timestamp: string;
};

export type FaceRecognitionData = {
    id: string,
    face_descriptor: string,
}
/** Face Recognition */