import { Readable } from "stream";
import { FormData } from "formdata-node";
import { FormDataEncoder } from "form-data-encoder";

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
  const formDataEncoder = new FormDataEncoder(formData);
  const formDataEncoded = formDataEncoder.encode();
  return {
    data: Readable.from(formDataEncoded),
    headers: formDataEncoder.headers,
  };
}
