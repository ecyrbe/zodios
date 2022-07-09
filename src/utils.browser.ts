/// <reference lib="dom" />

/**
 * getFormDataStream
 * @param data - the data to be encoded as form data stream
 * @returns a readable stream of the form data and optionnaly headers
 */
export function getFormDataStream(data: Record<string, string | Blob>) {
  const formData = new FormData();
  for (const key in data) {
    formData.append(key, data[key]);
  }
  return {
    data: formData,
  };
}
