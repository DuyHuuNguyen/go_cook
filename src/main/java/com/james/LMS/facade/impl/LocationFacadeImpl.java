package com.james.LMS.facade.impl;

import com.james.LMS.facade.LocationFacade;
import com.james.LMS.request.WardCriteria;
import com.james.LMS.response.BaseResponse;
import com.james.LMS.response.ProvinceResponse;
import com.james.LMS.response.WardResponse;
import com.james.LMS.service.ProvinceService;
import com.james.LMS.service.WardService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LocationFacadeImpl implements LocationFacade {
  private final ProvinceService provinceService;
  private final WardService wardService;

  @Override
  public BaseResponse<List<ProvinceResponse>> findAllProvinces() {
    List<ProvinceResponse> provinceResponses =
        this.provinceService.findAll().stream()
            .map(
                province ->
                    ProvinceResponse.builder()
                        .code(province.getCode())
                        .fullName(province.getFullName())
                        .build())
            .toList();

    return BaseResponse.build(provinceResponses, true);
  }

  @Override
  public BaseResponse<List<WardResponse>> findByWardName(WardCriteria criteria) {
    List<WardResponse> wardResponses =
        this.wardService.findByFullNameLike(criteria.getWardName()).stream()
            .map(
                ward ->
                    WardResponse.builder()
                        .fullName(ward.getFullName())
                        .code(ward.getCode())
                        .build())
            .toList();
    return BaseResponse.build(wardResponses, true);
  }
}
