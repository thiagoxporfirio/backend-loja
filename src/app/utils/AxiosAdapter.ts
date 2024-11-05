import axios from "axios";

interface HttpClient {
	get(url: string): Promise<any>;
	post(url: string, data: any): Promise<any>;
}

export default class AxiosAdapter implements HttpClient {
	async get(url: string): Promise<any> {
		const response = await axios.get(url);
		return response.data;
	}

	async post(url: string, data: any, options = {}): Promise<any> {
		const response = await axios.post(url, data, options);
		return response.data;
	}
}
