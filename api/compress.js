import formidable from 'formidable';
import fs from 'fs';
import axios from 'axios';
import path from 'path';

export const config = {
    api: {
        bodyParser: false,
    },
};

const BASE_URL = 'https://termai.cc';
const API_ENDPOINT = `${BASE_URL}/api/tools/compress-video`;

const DEFAULT_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': `${BASE_URL}/tools/compress`,
    'Origin': BASE_URL
};

async function detectContentType(filePath, buffer) {
    if (filePath && fs.existsSync(filePath)) {
        const ext = path.extname(filePath).toLowerCase();
        const mimeMap = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.webp': 'image/webp',
            '.mp4': 'video/mp4',
            '.webm': 'video/webm',
            '.avi': 'video/x-msvideo',
            '.mov': 'video/quicktime'
        };
        if (mimeMap[ext]) return mimeMap[ext];
    }

    try {
        const { fileTypeFromBuffer } = await import('file-type');
        const fileType = await fileTypeFromBuffer(buffer);
        if (fileType && fileType.mime) {
            return fileType.mime;
        }
    } catch (_) {}

    return 'application/octet-stream';
}

async function termaiCompress(buffer, filePath, mimeType) {
    let contentType = mimeType;

    if (!buffer || buffer.length === 0) {
        throw new Error('File buffer kosong.');
    }

    if (!contentType || contentType === 'application/octet-stream') {
        contentType = await detectContentType(filePath, buffer);
    }

    // 1. Inisialisasi Tiket Kompresi (Berlaku untuk Gambar & Video)
    const { data: postRes } = await axios.post(API_ENDPOINT, null, {
        headers: DEFAULT_HEADERS,
        timeout: 10000
    });

    if (!postRes || !postRes.status || !postRes.ticketId) {
        throw new Error(postRes?.message || 'Gagal membuat tiket kompresi ke Termai.');
    }

    const ticketId = postRes.ticketId;

    // 2. Upload Buffer File (Gambar/Video) ke Server Termai
    const { data: putRes } = await axios.put(`${API_ENDPOINT}?ticketId=${ticketId}`, buffer, {
        headers: {
            ...DEFAULT_HEADERS,
            'Content-Type': contentType
        },
        timeout: 30000
    });

    if (!putRes || !putRes.status) {
        throw new Error(putRes?.message || 'Gagal mengunggah file media.');
    }

    // 3. Polling Status Pengerjaan Termai
    const timeoutMs = 50000;
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
        await new Promise(r => setTimeout(r, 1500));

        const { data: statusRes } = await axios.get(`${API_ENDPOINT}?id=${ticketId}`, {
            headers: DEFAULT_HEADERS,
            timeout: 10000
        });

        if (statusRes.ticketStatus === 'completed') {
            const downloadUrl = statusRes.video?.url || statusRes.url;
            return {
                status: true,
                download: downloadUrl,
                details: statusRes.details || null
            };
        } else if (statusRes.ticketStatus === 'failed' || statusRes.status === false) {
            throw new Error(statusRes.message || 'Proses kompresi gagal di server Termai.');
        }
    }

    throw new Error(`Waktu kompresi habis (${timeoutMs / 1000}s).`);
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ status: false, error: 'Method not allowed' });
    }

    const form = formidable({ keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(500).json({ status: false, error: 'Gagal membaca file upload.' });
        }

        const uploadedFile = Array.isArray(files.mediaFile) ? files.mediaFile[0] : files.mediaFile;
        if (!uploadedFile) {
            return res.status(400).json({ status: false, error: 'Tidak ada file yang diunggah.' });
        }

        try {
            const fileBuffer = fs.readFileSync(uploadedFile.filepath);
            const result = await termaiCompress(fileBuffer, uploadedFile.filepath, uploadedFile.mimetype);

            return res.status(200).json({
                status: true,
                download: result.download,
                details: result.details
            });

        } catch (error) {
            return res.status(500).json({ status: false, error: error.message });
        } finally {
            if (uploadedFile.filepath && fs.existsSync(uploadedFile.filepath)) {
                fs.unlinkSync(uploadedFile.filepath);
            }
        }
    });
}
