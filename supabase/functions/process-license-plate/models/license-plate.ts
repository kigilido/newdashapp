
export interface MindeeModelConfig {
  name: string;
  version: string;
  endpoint: string;
  parameters?: Record<string, any>;
}

export const DEFAULT_MODEL: MindeeModelConfig = {
  name: 'mindee/ocr',
  version: '1.1',
  endpoint: 'https://api.mindee.net/v1/products/mindee/ocr/v1/predict'
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
      console.error('Invalid model config: missing required fields, using default model');
      return DEFAULT_MODEL;
    }

    // Validate endpoint URL format
    if (!config.endpoint.startsWith('https://api.mindee.net/')) {
      console.error('Invalid endpoint URL format, using default model');
      return DEFAULT_MODEL;
    }

    try {
      new URL(config.endpoint);
      return config;
    } catch (error) {
      console.error('Invalid endpoint URL:', error);
      return DEFAULT_MODEL;
    }
  } catch (error) {
    console.error('Error parsing model config:', error);
    return DEFAULT_MODEL;
  }
}
