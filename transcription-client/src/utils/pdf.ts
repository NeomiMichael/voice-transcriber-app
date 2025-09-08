// Lightweight PDF download helper using jsPDF if available, with a text fallback
export async function downloadTranscriptPdf(fileNameBase: string, text: string) {
  const safeBase = fileNameBase.replace(/\.[^/.]+$/, '') || 'transcript'
  const fileName = `${safeBase}.pdf`

  try {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const margin = 40
    const pageWidth = doc.internal.pageSize.getWidth()
    const maxWidth = pageWidth - margin * 2
    const lines = doc.splitTextToSize(text, maxWidth)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(12)
    let y = margin
    const lineHeight = 18
    lines.forEach((line: string) => {
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage()
        y = margin
      }
      doc.text(line, margin, y, { align: 'right' })
      y += lineHeight
    })
    doc.save(fileName)
    return
  } catch {
    // Fallback: download as .txt with .pdf suffix
    const blob = new Blob([text], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  }
}


