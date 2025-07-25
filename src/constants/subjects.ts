export const subList = [
  { name: 'English', code: 'eng' },
  { name: 'Physics', code: 'phy' },
  { name: 'Chemistry', code: 'chem' },
  { name: 'Biology', code: 'bio' },
  { name: 'Computer Application', code: 'cs' },
  { name: 'History', code: 'hist' },
  { name: 'Geography', code: 'geo' },
  { name: 'Mathematics', code: 'math' },
];

export const getSubjectName = (code: string): string => {
  const subject = subList.find(sub => sub.code === code);
  return subject ? subject.name : code;
};