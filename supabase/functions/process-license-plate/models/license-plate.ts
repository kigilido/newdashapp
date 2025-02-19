
export interface MindeeModelConfig {
  name: string;
  version: string;
  endpoint: string;
  parameters?: Record<string, any>;
}

export const DEFAULT_MODEL: MindeeModelConfig = {
  name: 'mindee/license_plates',
  version: 'v1',
  endpoint: 'https://api.mindee.net/v1/products/mindee/license_plates/v1/predict'
};

export const getLicensePlateModel = (): MindeeModelConfig => {
  const modelConfig = Deno.env.get('MINDEE_MODEL_CONFIG');
  
  if (!modelConfig) {
    console.log('No custom model config found, using default model');
    return DEFAULT_MODEL;
  }

  try {
    const config = JSON.parse(modelConfig);
    
    // Validate required fields
    if (!config.name || !config.version || !config.endpoint) {
      console.error('Invalid model config: missing required fields');
      return DEFAULT_MODEL;
    }

    // Validate endpoint URL
    try {
      new URL(config.endpoint);
    } catch (error) {
      console.error('Invalid endpoint URL in config:', error);
      return DEFAULT_MODEL;
    }

    return config;
  } catch (error) {
    console.error('Error parsing model config:', error);
    return DEFAULT_MODEL;
  }
}
