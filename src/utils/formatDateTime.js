export function formatDT(date) {
    date = new Date(date)

    let hours = String(date.getHours()).padStart(2, "0")
    hours = hours % 12
    hours = hours ? hours : 12

    const minutes = String(date.getMinutes()).padStart(2, "0")

    const formattedDate = date.toLocaleDateString('en-GB');
    
    const ampm = hours < 12 ? "AM" : "PM"

    const formattedDT = `${hours}:${minutes}${ampm} - ${formattedDate}`

    return formattedDT
}