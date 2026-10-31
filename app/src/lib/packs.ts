// Where pack content comes from. A pack is a folder under packs/: nothing here names
// one, so adding a pack needs no code. Reading goes through `PackSource`, so that
// downloads can replace the local folder (v0.3.0, #6) without touching any screen.

import {
	layerNames,
	localizeUnit,
	mergeCourse,
	offeredFor,
	type CourseText,
	type Lesson,
	type LocalUnit,
	type PackManifest,
	type StudyLink,
	type Unit,
	type UnitText
} from '@langclick/pack-format';

export interface PackSource {
	manifests(): PackManifest[];
	/** One JSON file of a pack, by its path inside the pack. */
	read<T>(packId: string, path: string): Promise<T | undefined>;
}

const PACKS_ROOT = '../../../packs';

const manifestFiles = import.meta.glob<PackManifest>('../../../packs/*/pack.json', {
	eager: true,
	import: 'default'
});
// Check records aren't content: they stay out of what a learner receives.
const contentFiles = import.meta.glob<unknown>(
	['../../../packs/*/units/*.json', '../../../packs/*/layers/**/*.json'],
	{ import: 'default' }
);

export const localPackSource: PackSource = {
	manifests() {
		return Object.values(manifestFiles);
	},
	async read<T>(packId: string, path: string) {
		return contentFiles[`${PACKS_ROOT}/${packId}/${path}`]?.() as Promise<T | undefined>;
	}
};

let source: PackSource = localPackSource;

/** Tests only. */
export function usePackSource(next: PackSource): void {
	source = next;
}

/** What a learner has chosen; settings.svelte.ts keeps the real one. */
export interface LayerChoice {
	compareWith: string | undefined;
	explainIn: string;
}

export function listPacks(): PackManifest[] {
	return [...source.manifests()].sort((a, b) => a.id.localeCompare(b.id));
}

export function findPack(packId: string): PackManifest | undefined {
	return source.manifests().find((pack) => pack.id === packId);
}

async function courseText(pack: PackManifest, choice: LayerChoice): Promise<CourseText> {
	const { base, overlay } = layerNames(pack, choice.compareWith, choice.explainIn);
	const [baseCourse, overlayCourse] = await Promise.all([
		source.read<CourseText>(pack.id, `layers/${base}/course.json`),
		overlay ? source.read<CourseText>(pack.id, `layers/${overlay}/course.json`) : undefined
	]);
	return mergeCourse(baseCourse ?? {}, overlayCourse);
}

async function localUnit(
	pack: PackManifest,
	unitId: string,
	choice: LayerChoice,
	course: CourseText
): Promise<LocalUnit | undefined> {
	const unit = await source.read<Unit>(pack.id, `units/${unitId}.json`);
	if (!unit || !offeredFor(unit, choice.compareWith)) return undefined;
	const { base, overlay } = layerNames(pack, choice.compareWith, choice.explainIn);
	const [baseText, overlayText] = await Promise.all([
		source.read<UnitText>(pack.id, `layers/${base}/units/${unitId}.json`),
		overlay ? source.read<UnitText>(pack.id, `layers/${overlay}/units/${unitId}.json`) : undefined
	]);
	return localizeUnit(unit, baseText, overlayText, course);
}

/** One unit as this learner sees it, or undefined if it isn't offered to them. */
export async function loadUnit(
	pack: PackManifest,
	unitId: string,
	choice: LayerChoice
): Promise<LocalUnit | undefined> {
	return localUnit(pack, unitId, choice, await courseText(pack, choice));
}

export interface LocalLesson {
	id: string;
	title: string;
	study: StudyLink[];
	units: LocalUnit[];
}

function lessonFor(lesson: Lesson, course: CourseText, units: LocalUnit[], choice: LayerChoice) {
	return {
		id: lesson.id,
		title: course.lessons?.[lesson.id]?.title ?? lesson.id,
		study: lesson.study.filter((link) => offeredFor(link, choice.compareWith)),
		units
	};
}

/** The whole course as this learner sees it, in teaching order. */
export async function loadCourse(pack: PackManifest, choice: LayerChoice): Promise<LocalLesson[]> {
	const course = await courseText(pack, choice);
	return Promise.all(
		pack.lessons.map(async (lesson) => {
			const units = await Promise.all(
				lesson.units.map((id) => localUnit(pack, id, choice, course))
			);
			return lessonFor(
				lesson,
				course,
				units.filter((unit) => unit !== undefined),
				choice
			);
		})
	);
}
