package com.james.LMS.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "menu_assets")
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class MenuAsset extends BaseEntity {

  @Column(name = "url", nullable = false, length = 300)
  private String url;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "menu_id", nullable = false)
  private Menu menu;

  public void softDelete() {
    super.isActive = false;
  }
}
