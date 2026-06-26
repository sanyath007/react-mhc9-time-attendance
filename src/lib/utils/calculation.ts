// Calculate age
export const calculateAge = (birthday: string): string => {
    if (!birthday) return '';
    const birthDate = new Date(birthday);
    const today = new Date();

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();

    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
        years--;
        months += 12;
    }

    if (today.getDate() < birthDate.getDate()) {
        months--;
    }

    if (years < 1) return `${months}M`;

    return months > 0 ? `${years}Y ${months}M` : `${years}Y`;
};