/*DO NOT EDIT!!!!!!!!*/
const allowOrigin = "*"

export async function headerBuilder(statuscode) {
    return {
        status: statuscode,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": allowOrigin,
            "Access-Control-Allow-Methods": "GET, POST, HEAD, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        }
    };
}
/*DO NOT EDIT!!!!!!!*/