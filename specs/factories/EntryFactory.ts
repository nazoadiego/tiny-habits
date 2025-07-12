// factories/user.ts
import { Factory } from 'fishery';
import Entry from 'models/Entry';
import { dateValueFactory } from './DateValueFactory';

export const entryFactory = Factory.define<Entry>(({ params }) => {
	const dateValue = dateValueFactory.build()

	return new Entry({ habitId: "a-file-name", habitPath: "folder/a-file-name.md", date: dateValue, status: params.status || Entry.STATUS.unstarted })
});