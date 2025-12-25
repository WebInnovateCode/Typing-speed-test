export default async function fetchData(url) {
    try {
        const response = await fetch(url);
        return response.json();
    } catch (error) {
        console.error(error);
        return;
    }
}
