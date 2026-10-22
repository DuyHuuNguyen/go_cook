package com.james.LMS.dto;

import com.james.LMS.entity.Menu;
import lombok.Builder;

@Builder
public record FindingOrCreatingCategoryDTO(boolean isCreateNewCategory, Long categoryId, String newCategoryName , Menu menu) {
}
