// TODO: Kibana has already provided mocks for the Core services, it can be used when the plugin is implemented by Typescript
const coreMock = jest.fn();

coreMock.uiSettings = jest.fn();
coreMock.uiSettings.get = jest.fn();

export default coreMock;
