import { Config } from '../models/config';
import { ConfigLike } from '../../types/config-like';

export interface IConfigProvider {
	Get(): Promise<Config>;

	Set(config: ConfigLike): Promise<void>;
}
