import { customFetch } from './axiosSetup';

export async function fetchDocumentBlobUrl(documentUrl, client = customFetch) {
    const { data } = await client.get('/document/view', {
        params: { url: documentUrl },
        responseType: 'blob',
    });

    const blobType = data?.type || 'application/pdf';
    const blob = new Blob([data], { type: blobType });
    return URL.createObjectURL(blob);
}

export function cleanupBlobUrl(blobUrl) {
    if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
    }
}
