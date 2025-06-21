// factories/user.ts
import { Factory } from 'fishery';
import Entry from 'models/Entry';
import { dateValueFactory } from './DateValueFactory';

export const entryFactory = Factory.define<Entry>(({ params }) => {
	const dateValue = dateValueFactory.build()

	return new Entry({ habitPath: "a-path", date: dateValue, status: params.status || Entry.STATUS.unstarted })
});