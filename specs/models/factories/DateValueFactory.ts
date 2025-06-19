// factories/user.ts
import { Factory } from 'fishery';
import DateValue from 'models/DateValue';

export const dateValueFactory = Factory.define<DateValue>(() => {
	return new DateValue(new Date())
});
