import moment from 'moment';

export const getBrands = async(user_id: string | undefined) => {
    const res = await fetch("/api/brands/get_brands", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user_id
        })
    });
    if (res.status == 200) {
        const brands = await res.json();
        return brands;
    } else {
        return []
    }
}

export const convertDate = (date: string) => {
    const inputDateTime = new Date(date);

    // Define the target timezone offset
    const targetTimezoneOffset = 0; // GMT+2

    // Apply the timezone offset to the input date and time
    inputDateTime.setHours(inputDateTime.getHours() + targetTimezoneOffset);

    // Extract the individual components
    const year = inputDateTime.getFullYear();
    const month = String(inputDateTime.getMonth() + 1).padStart(2, '0');
    const day = String(inputDateTime.getDate()).padStart(2, '0');
    const hours = String(inputDateTime.getHours()).padStart(2, '0');
    const minutes = String(inputDateTime.getMinutes()).padStart(2, '0');

    // Format the components into the desired output string
    const outputDateTime = `${day}.${month}.${year} ${hours}:${minutes}`;
    return outputDateTime;
}
export const convertTime =(date: string) => {
    const inputDateTime = new Date(date);

    // Define the target timezone offset
    const targetTimezoneOffset = 0; // GMT+2

    // Apply the timezone offset to the input date and time
    inputDateTime.setHours(inputDateTime.getHours() + targetTimezoneOffset);
    const hours = String(inputDateTime.getHours()).padStart(2, '0');
    const minutes = String(inputDateTime.getMinutes()).padStart(2, '0');
    const outputDateTime = `${hours}:${minutes}`;
    return outputDateTime;
}
export const convertDateIso = (date: string) => {
    const inputDateTime = new Date(date);

    // Define the target timezone offset
    const targetTimezoneOffset = 0; // GMT+2

    // Apply the timezone offset to the input date and time
    inputDateTime.setHours(inputDateTime.getHours() + targetTimezoneOffset);

    // Extract the individual components
    const year = inputDateTime.getFullYear();
    const month = String(inputDateTime.getMonth() + 1).padStart(2, '0');
    const day = String(inputDateTime.getDate()).padStart(2, '0');
    const hours = String(inputDateTime.getHours()).padStart(2, '0');
    const minutes = String(inputDateTime.getMinutes()).padStart(2, '0');

    // Format the components into the desired output string
    const outputDateTime = `${day}.${month}.${year}`;
    return outputDateTime;
}

export const convertDateToYmd = (date: string) => {
    const inputDateTime = new Date(date);
    
    // Define the target timezone offset
    const targetTimezoneOffset = 0; // GMT+2

    // Apply the timezone offset to the input date and time
    inputDateTime.setHours(inputDateTime.getHours() + targetTimezoneOffset);

    // Extract the individual components
    const year = inputDateTime.getFullYear();
    const month = String(inputDateTime.getMonth() + 1).padStart(2, '0');
    const day = String(inputDateTime.getDate()).padStart(2, '0');
    const hours = String(inputDateTime.getHours()).padStart(2, '0');
    const minutes = String(inputDateTime.getMinutes()).padStart(2, '0');

    // Format the components into the desired output string
    const outputDateTime = `${year}-${month}-${day}T${hours}`;
    return outputDateTime;
}

export const convertDateForDB = (timestamp: number) => {
    const date = moment(timestamp);
    const addeddate = date.add(1, 'hours');
    const formattedDate = addeddate.format('YYYY-MM-DDTHH:mm:ss')
    return formattedDate;
}