
export const getLicensePlateModel = () => {
  const MINDEE_MODEL_CONFIG = Deno.env.get('MINDEE_MODEL_CONFIG') || 'kigilido/license_plate/v1';
  const [owner, name, version] = MINDEE_MODEL_CONFIG.split('/');
  
  return {
    name: MINDEE_MODEL_CONFIG,
    version: version,
    owner: owner,
    endpoint: `https://api.mindee.net/v1/products/${owner}/${name}/${version}/predict_async`,
    documentEndpoint: `https://api.mindee.net/v1/products/${owner}/${name}/${version}/documents`,
  };
};

