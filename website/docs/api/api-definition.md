---
sidebar_position: 1
---

# API definition

Zodios uses a centralised definition to declare your REST API endpoints.

The API definition is the only object that you need to share between your server and client code.
If you don't have the control over your API server or if it's developped in another language than javascript, you can still use Zodios API definition only for your client.

## API Definition Structure

The API definition is a javascript array of endpoint descriptions. Each endpoint description is an object with the following properties:

| Property      | Type                                          | Description                                                    |
| ------------- | --------------------------------------------- | -------------------------------------------------------------- |
| method        | string                                        | The HTTP method of the endpoint.                               |
| path          | string                                        | The path of the endpoint.                                      |
| response      | ZodSchema                                     | The response Schema of the endpoint using Zod.                 |
| status        | number                                        | The status code of the response. default: 200                  |
| alias         | string                                        | Optional alias of the endpoint.                                |
| immutable     | boolean                                       | Optional flag to indicate if the 'post' endpoint is immutable. |
| description   | string                                        | Optional description of the endpoint. Used for openapi.        |
| requestFormat | `json`,`form-data`,`form-url`,`binary`,`text` | Optional request format of the endpoint. Default is `json`.    |
| parameters    | array                                         | Optional parameters of the endpoint.                           |
| errors        | array                                         | Optional errors of the endpoint.                               |

### Parameters

The parameters of an endpoint are an array of parameter descriptions. Each parameter description is an object with the following properties:

| Property    | Type                                | Description                                             |
| ----------- | ----------------------------------- | ------------------------------------------------------- |
| name        | string                              | The name of the parameter.                              |
| type        | `Path`, `Query`, `Body` or `Header` | The type of the parameter.                              |
| description | string                              | Optional description of the endpoint. Used for openapi. |
| schema      | ZodSchema                           | The schema of the parameter using Zod.                  |

:::note Path parameters do not need to be defined in the API definition `parameters` array.
Indeed, they are automatically deduced from the path and added to the request parameters implicitly.
Only declare path parameters in the `parameters` array if you want to add a description or a schema to validate them
:::


### Errors

The errors of an endpoint are an array of error descriptions. Each error description is an object with the following properties:

| Property    | Type      | Description                                          |
| ----------- | --------- | ---------------------------------------------------- |
| status      | number    | The status code of the error.                        |
| description | string    | Optional description of the error. Used for openapi. |
| schema      | ZodSchema | The schema of the error using Zod.                   |
