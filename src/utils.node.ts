import { Readable } from "stream";

/**
 * getFormDataStream
 * @param data - the data to be encoded as form data stream
 * @returns a readable stream of the form data and optionnaly headers
 */
export async function getFormDataStream(data: Record<string, string | Blob>) {
  const { FormData } = await import("formdata-node");
  const { FormDataEncoder } = await import("form-data-encoder");

  const formData = new FormData();
  for (const key in data) {
    formData.append(key, data[key]);
  }
  const formDataEncoder = new FormDataEncoder(formData);
  const formDataEncoded = formDataEncoder.encode();
  return {
    data: Readable.from(formDataEncoded),
    headers: formDataEncoder.headers,
  };
}
