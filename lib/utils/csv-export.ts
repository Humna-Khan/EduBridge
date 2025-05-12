export function convertToCSV(data: any[], headers: string[]) {
    // Create header row
    const headerRow = headers.join(",")

    // Create data rows
    const dataRows = data.map((item) => {
        return headers.map((header) => {
            const value = item[header.toLowerCase()]
            // Handle values that might contain commas
            return typeof value === "string" && value.includes(",") ? `"${value}"` : value
        }).join(",")
    })

    // Combine header and data rows
    return [headerRow, ...dataRows].join("\n")
}

export function downloadCSV(csvContent: string, filename: string) {
    // Create a blob with the CSV content
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })

    // Create a download link
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    // Set link properties
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"

    // Add link to document, click it, and remove it
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
} 