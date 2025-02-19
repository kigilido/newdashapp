
interface LicensePlateModel {
  name: string;
  version: string;
  endpoint: string;
}

export const getLicensePlateModel = (): LicensePlateModel => {
  return {
    name: 'license_plates',
    version: '2.0',
    endpoint: 'https://api.mindee.net/v1/products/mindee/license_plates/v2/predict'
  };
};
