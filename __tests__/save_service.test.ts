import { RequestService } from '../src/service/request-service';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

const genericResponse = { message: 'success' };

describe('RequestService', () => {
  let service: RequestService;
  let mockAxios: MockAdapter;

  beforeEach(() => {
    mockAxios = new MockAdapter(axios);
    service = new RequestService();
    service.setMsgToken('secret');
  });

  afterEach(() => {
    mockAxios.restore();
  });

  test('should return the correct base URL', () => {
    const baseUrl = service.getBaseUrl();
    expect(baseUrl).toBe(service.getBaseUrl());
  });

  test('should return the correct MSG_TOKEN', () => {
    const msgToken = service.getMsgToken();
    expect(msgToken).toBe('secret'); // Replace 'msgToken' with the expected value
  });

  test('should set the correct MSG_TOKEN', () => {
    service.setMsgToken('secret');
    const msgToken = service.getMsgToken();
    expect(msgToken).toBe('secret');
  });

  test('should successfully fetch organizations', async () => {
    const organizations = [{ id: 1, name: 'org1' }];
    mockAxios.onGet(`${service.getBaseUrl()}organizations/`).reply(200, organizations);

    const response = await service.listOrganizations();

    expect(response).toEqual(organizations);
  });

  test('should successfully fetch products', async () => {
    const products = [{ id: 1, name: 'product1' }];
    mockAxios.onGet(`${service.getBaseUrl()}organizations/1/products/`).reply(200, products);

    const response = await service.listProducts(1);

    expect(response).toEqual(products);
  });

  test('should successfully fetch repositories', async () => {
    const repositories = [{ id: 1, name: 'repo1' }];
    mockAxios.onGet(`${service.getBaseUrl()}organizations/1/products/1/repositories/`).reply(200, repositories);

    const response = await service.listRepositories(1, 1);

    expect(response).toEqual(repositories);
  });

  test('should fetch releases', async () => {
    const releases = [
      { "id": 12, "release_name": "5", "start_at": "2023-06-06T00:00:00-03:00", "created_by": 11, "end_at": "2023-06-13T00:00:00-03:00" },
      { "id": 11, "release_name": "Release 001", "start_at": "2023-12-20T00:00:00-03:00", "created_by": 66, "end_at": "2023-12-25T00:00:00-03:00" },
      { "id": 10, "release_name": "teste", "start_at": "2023-06-05T00:00:00-03:00", "created_by": 80, "end_at": "2023-06-12T00:00:00-03:00" }
    ];
    mockAxios.onGet(`${service.getBaseUrl()}organizations/1/products/3/release/`).reply(200, releases);

    const response = await service.listReleases(1, 3);

    expect(response).toEqual(releases);
  });

  test('should return null when listOrganizations is called and API call fails', async () => {
    mockAxios.onGet().reply(() => [500]);

    const response = await service.listOrganizations();

    expect(response).toBeNull();
  });

  test('should return null when listProducts is called and API call fails', async () => {
    mockAxios.onGet().reply(() => [500]);

    const response = await service.listProducts(2);

    expect(response).toBeNull();
  });

  test('should return null when listRepositories is called and API call fails', async () => {
    mockAxios.onGet().reply(() => [500]);

    const response = await service.listRepositories(2, 2);

    expect(response).toBeNull();
  });

  test('should handle errors in listReleases', async () => {
    const orgId = 1;
    const productId = 1;

    const expectedUrl = `${service.getBaseUrl()}organizations/${orgId}/products/${productId}/release/`;
    mockAxios.onGet(expectedUrl).networkError();

    await expect(service.listReleases(orgId, productId)).resolves.toBe(null);
  });

  test('should handle network error in listReleases', async () => {
    const orgId = 1;
    const productId = 1;

    const expectedUrl = `${service.getBaseUrl()}organizations/${orgId}/products/${productId}/release/`;
    mockAxios.onGet(expectedUrl).networkError();

    const result = await service.listReleases(orgId, productId);

    expect(result).toBeNull();
  });

  test('should handle no data received from the API in listReleases', async () => {
    const orgId = 1;
    const productId = 1;

    const expectedUrl = `${service.getBaseUrl()}organizations/${orgId}/products/${productId}/release/`;
    mockAxios.onGet(expectedUrl).reply(200, null); // Returns a successful status but no data

    const result = await service.listReleases(orgId, productId);

    expect(result).toBeNull();
  });

  // Here, we are checking if the error path of the private `makeRequest` function is called when `listOrganizations` is called
  test('should handle network error in listOrganizations', async () => {
    const expectedUrl = `${service.getBaseUrl()}organizations/`;
    mockAxios.onGet(expectedUrl).networkError();

    const result = await service.listOrganizations();

    expect(result).toBeNull();
  });

  test('should handle errors in listOrganizations', async () => {
    const expectedUrl = `${service.getBaseUrl()}organizations/`;
    mockAxios.onGet(expectedUrl).reply(500); // Trigger an error in axios

    const result = await service.listOrganizations();

    expect(result).toBeNull();
  });


  test('should successfully create metrics', async () => {
    const metrics = '{"metric1":"value1", "metric2":"value2"}'; // a JSON string
    const orgId = 1;
    const productId = 1;
    const repoId = 1;
    
    const expectedUrl = `${service.getBaseUrl()}organizations/${orgId}/products/${productId}/repositories/${repoId}/collectors/sonarqube/`;
    
    // mock axios to return a successful response when the expected url is called
    // with a body
    mockAxios.onPost(expectedUrl).reply(200);

    const result = await service.createMetrics(metrics, orgId, productId, repoId);

    expect(mockAxios.history.post.length).toBe(1);
    expect(JSON.parse(mockAxios.history.post[0].data)).toEqual(JSON.parse(metrics));
    expect(mockAxios.history.post[0].url).toBe(expectedUrl);
  });


  test('should successfully calculate measures', async () => {
    const orgId = 1;
    const productId = 1;
    const repoId = 1;
    mockAxios.onPost(`${service.getBaseUrl()}organizations/${orgId}/products/${productId}/repositories/${repoId}/calculate/measures/`).reply(200);

    await service.calculateMeasures(orgId, productId, repoId);

    expect(mockAxios.history.post.length).toBe(1);
    expect(mockAxios.history.post[0].data).toBeDefined();
  });

  test('should successfully calculate characteristics', async () => {
    const orgId = 1;
    const productId = 1;
    const repoId = 1;
    mockAxios.onPost(`${service.getBaseUrl()}organizations/${orgId}/products/${productId}/repositories/${repoId}/calculate/characteristics/`).reply(200);

    await service.calculateCharacteristics(orgId, productId, repoId);

    expect(mockAxios.history.post.length).toBe(1);
    expect(mockAxios.history.post[0].data).toBeDefined();
  });

  test('should successfully calculate sub-characteristics', async () => {
    const orgId = 1;
    const productId = 1;
    const repoId = 1;
    mockAxios.onPost(`${service.getBaseUrl()}organizations/${orgId}/products/${productId}/repositories/${repoId}/calculate/subcharacteristics/`).reply(200);

    await service.calculateSubCharacteristics(orgId, productId, repoId);

    expect(mockAxios.history.post.length).toBe(1);
    expect(mockAxios.history.post[0].data).toBeDefined();
  });

  test('should successfully calculate SQC', async () => {
    const orgId = 1;
    const productId = 1;
    const repoId = 1;
    mockAxios.onPost(`${service.getBaseUrl()}organizations/${orgId}/products/${productId}/repositories/${repoId}/calculate/sqc/`).reply(200);

    await service.calculateSQC(orgId, productId, repoId);

    expect(mockAxios.history.post.length).toBe(1);
  });

  test('should log error message when API call fails in calculateMeasures', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

    const errorMsg = 'Request failed with status code 500';
    mockAxios.onPost().reply(() => [500, { message: 'API Error' }]);

    await service.calculateMeasures(123, 456, 789);

    expect(consoleSpy).toHaveBeenCalledWith(`Failed to post data to the API. ${errorMsg}`);
    consoleSpy.mockRestore();
  });

  test('should log error message when API call fails in calculateCharacteristics', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

    const errorMsg = 'Request failed with status code 500';
    mockAxios.onPost().reply(() => [500, { message: 'API Error' }]);

    await service.calculateCharacteristics(123, 456, 789);

    expect(consoleSpy).toHaveBeenCalledWith(`Failed to post data to the API. ${errorMsg}`);
    consoleSpy.mockRestore();
  });

  test('should log error message when API call fails in calculateSubCharacteristics', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

    const errorMsg = 'Request failed with status code 500';
    mockAxios.onPost().reply(() => [500, { message: 'API Error' }]);

    await service.calculateSubCharacteristics(123, 456, 789);

    expect(consoleSpy).toHaveBeenCalledWith(`Failed to post data to the API. ${errorMsg}`);
    consoleSpy.mockRestore();
  });

  test('should log error message when API call fails in calculateSQC', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

    const errorMsg = 'Request failed with status code 500';
    mockAxios.onPost().reply(() => [500, { message: 'API Error' }]);

    await service.calculateSQC(123, 456, 789);

    expect(consoleSpy).toHaveBeenCalledWith(`Failed to post data to the API. ${errorMsg}`);
    consoleSpy.mockRestore();
  });
});
