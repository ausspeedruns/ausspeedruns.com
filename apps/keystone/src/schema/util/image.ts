import { image as k6Image, ImageFieldConfig } from '@keystone-6/core/fields';
import { AzureStorageConfig, azureStorageImage } from '@k6-contrib/fields-azure';
import { BaseListTypeInfo } from '@keystone-6/core/types';

const azureConfig: AzureStorageConfig = {
	azureStorageOptions: {
		account: process.env.AZURE_STORAGE_ACCOUNT_NAME,
		accessKey: process.env.AZURE_STORAGE_KEY,
		container: process.env.AZURE_STORAGE_CONTAINER,
		url: process.env.NODE_ENV === 'production' ? '' : `http://127.0.0.1:9999/${process.env.AZURE_STORAGE_ACCOUNT_NAME}`
	},
}

export function image<ListTypeInfo extends BaseListTypeInfo>(config?: ImageFieldConfig<ListTypeInfo>) {
	return azureStorageImage({azureStorageConfig: azureConfig, ...config});
}
