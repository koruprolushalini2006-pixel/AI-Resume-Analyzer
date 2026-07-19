const fs = require('fs/promises');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const ApiError = require('../utils/ApiError');

const extractFromPdf = async (filePath) => {
  const buffer = await fs.readFile(filePath);
  const data = await pdfParse(buffer);
  return data.text;
};

const extractFromDocx = async (filePath) => {
  const { value } = await mammoth.extractRawText({ path: filePath });
  return value;
};

const extractText = async (filePath, fileType) => {
  let text;

  if (fileType === 'pdf') {
    text = await extractFromPdf(filePath);
  } else if (fileType === 'docx') {
    text = await extractFromDocx(filePath);
  } else {
    throw new ApiError(400, `Unsupported file type: ${fileType}`);
  }

  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) {
    throw new ApiError(422, 'Could not extract any text from the uploaded file');
  }

  return cleaned;
};

module.exports = { extractText };
