const PDFDocument = require('pdfkit');

exports.toTxt = (note) => {
  return `${note.title}\n${'='.repeat(note.title.length)}\n\n${note.content || ''}\n\n` +
    `Labels: ${(note.labels || []).join(', ')}\nCreated: ${note.createdAt.toISOString()}\n`;
};

exports.toPdfStream = (note, res) => {
  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${note._id}.pdf"`);
  doc.pipe(res);
  doc.fontSize(22).text(note.title, { underline: true });
  doc.moveDown();
  doc.fontSize(12).fillColor('#444').text(note.content || '', { align: 'left' });
  doc.moveDown();
  doc.fontSize(10).fillColor('#888').text(`Labels: ${(note.labels || []).join(', ')}`);
  doc.text(`Created: ${note.createdAt.toLocaleString()}`);
  doc.end();
};
