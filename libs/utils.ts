
export const getIpAddress = async () => {
    const result = await fetch("https://api.ipify.org?format=json");
    const data = await result.json();
    return data.ip
}

