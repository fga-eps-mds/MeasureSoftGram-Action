import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

export class RequestService {
    private MSGRAM_SERVICE_HOST = 'https://measuresoft.herokuapp.com';
    private MSG_TOKEN = "'secret';"
    private baseUrl = `${this.MSGRAM_SERVICE_HOST}/api/v1/`;

    public getBaseUrl(): string {
        return this.baseUrl;
    }

    public getMsgToken(): string {
        return this.MSG_TOKEN;
    }
    
    public setMsgToken(token: string): void {
        this.MSG_TOKEN = token;
    }

    private async makeRequest(method: 'get' | 'post', url: string, data: object = {}): Promise<AxiosResponse | null> {
        const config: AxiosRequestConfig = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: this.MSG_TOKEN
            },
            method,
            url,
            data,
        };

        let response: AxiosResponse | null = null;

        try {
            response = await axios(config);
            console.log(`Data ${method === 'get' ? 'received' : 'sent'}. Status code: ${response?.status}`);
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError;
                console.error(`Failed to ${method} data to the API. ${axiosError.message}`);
            } else {
                console.error('An unexpected error occurred.');
            }
        }

        if (method == "post") return response;

        if (response?.data) {
            console.log(`Data received. Status code: ${response.status}`);
            return response.data;
        } else {
            console.error('No data received from the API.');
        }
        return null;
    }

    public async listOrganizations(): Promise<any> {
        const url = `${this.baseUrl}organizations/`;
        const response = await this.makeRequest('get', url);
        return response;
    }

    public async listProducts(orgId: number): Promise<any> {
        const url = `${this.baseUrl}organizations/${orgId}/products/`;
        const response = await this.makeRequest('get', url);
        return response;
    }

    public async listRepositories(orgId: number, productId: number): Promise<any> {
        const url = `${this.baseUrl}organizations/${orgId}/products/${productId}/repositories/`;
        return await this.makeRequest('get', url);
    }

    public async listReleases(orgId: number, productId: number): Promise<any> {
        const url = `${this.baseUrl}organizations/${orgId}/products/${productId}/release/`;    
        return await this.makeRequest('get', url);
    }
    

    public async createMetrics(metrics: string, orgId: number, productId: number, repoId: number): Promise<any> {
        const url = `${this.baseUrl}organizations/${orgId}/products/${productId}/repositories/${repoId}/collectors/sonarqube/`;
        const jsonData = JSON.parse(metrics);
        const response = await this.makeRequest('post', url, jsonData);

        return response;
    }

    public async calculateMeasures(orgId: number, productId: number, repoId: number): Promise<any> {
        const url = `${this.baseUrl}organizations/${orgId}/products/${productId}/repositories/${repoId}/calculate/measures/`;
        const data = { measures: [ { key: "passed_tests" }, { key: "test_builds" }, { key: "test_coverage" }, { key: "non_complex_file_density" }, { key: "commented_file_density" }, { key: "duplication_absense" } ] };
        const response = await this.makeRequest('post', url, data);
        return response;
    }

    public async calculateCharacteristics(orgId: number, productId: number, repoId: number): Promise<any> {
        const url = `${this.baseUrl}organizations/${orgId}/products/${productId}/repositories/${repoId}/calculate/characteristics/`;
        const data = { characteristics: [ { key: "reliability" }, { key: "maintainability" } ] };
        const response = await this.makeRequest('post', url, data);
        return response;
    }
    

    public async calculateSubCharacteristics(orgId: number, productId: number, repoId: number): Promise<any> {
        const url = `${this.baseUrl}organizations/${orgId}/products/${productId}/repositories/${repoId}/calculate/subcharacteristics/`;
        const data = { subcharacteristics: [ { key: "modifiability" }, { key: "testing_status" } ] };
        const response = await this.makeRequest('post', url, data);
        return response;
    }
    

    public async calculateSQC(orgId: number, productId: number, repoId: number): Promise<any> {
        const url = `${this.baseUrl}organizations/${orgId}/products/${productId}/repositories/${repoId}/calculate/sqc/`;
        const response = await this.makeRequest('post', url);
        return response;
    }
}
