// Education Level Mappings
export const educationLevelMap = {
  0: "Not Set",
  1: "Primary",
  2: "Secondary",
  3: "Post-Secondary",
  4: "Tertiary",
  5: "Post-Graduate"
};

// Schooling Status Mappings
export const schoolingStatusMap = {
  0: "Not In School",
  1: "In School"
};

// Helper functions
export const getEducationLevelLabel = (value) => {
  return educationLevelMap[value] || "-";
};

export const getSchoolingStatusLabel = (value) => {
  return schoolingStatusMap[value] || "-";
};
