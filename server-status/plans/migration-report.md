# 대전 서버실 이전 시뮬레이션 — 2026-10-24

**결론: 설정한 공간·전력 가정에서는 전체 이전 배치안 C를 구성할 수 있다. 다만 실제 랙 U, 섀시 모델, 회로/PDU 및 기존 부하 자료가 없으므로 물리·전기 검증을 마친 실행안은 아니다.** 서버실 폐쇄 실행 가능 여부는 현장 확인 전까지 조건부다.

## 1. 입력과 기준 현황

- 기준: 사용자 제공 `server-status-2026-10-24T02-16-12-024Z.json` (원본 백업은 로컬 별도 보관).
- 상세 자료: `대전 서버실 세부현황.xlsx`, 시트1 B3:C40·D3:G40. GPU 구성과 연구실 합계 전력만 제공되며 **서버 제조사/섀시 모델, 모델별 U 높이, 자산번호와 랙별 GPU 대응 정보는 없다.** GPU 모델을 섀시 모델로 간주하지 않았다.
- 첨부 안내의 우선순위와 폐기 조건을 적용한 오프라인 결과다. 페이지 원본·초기 데이터·브라우저 저장소·라이브 설정은 변경하지 않았다. 커밋/배포하지 않았다.
- 입력 JSON은 홍릉 8번 서버 4대와 9–13번 서버 30대가 이미 제거된 상태다. 이 상태를 유지한다. **추가로 1–6번 공용 서버 30대만 시뮬레이션에서 폐기**한다. HR01 Master 1대와 HR08 Master·Storage 등 비서버 장비는 전부 보존한다. 따라서 이미 제거된 장비를 중복 폐기하지 않는다.
- 입력에는 HR01–06이 여전히 점유 상태다. 실제 의도가 추가 폐기 없이 현재 빈 HR09–13만 사용하는 것이라면 이 결과의 선행조건이 다르므로 재계산해야 한다.

## 2. 전략 비교

장비 수는 서버뿐 아니라 NAS·Hub·Desktop·Terminal을 포함한다. A/B는 공간 하한으로 증명되는 **최대 장비 대수**를 달성했다. 중요도·이전 업무량·이전 U가 최대라는 의미는 아니다.

| JSON | 사용 랙 (1/2/3순위) | 이전 장비 | 대전 잔류 | 잔류 U / AC kW | 결과 |
|---|---:|---:|---:|---:|---|
| [01-priority1-partial.json](01-priority1-partial.json) | 8 / 0 / 0 | 55 (44 서버) | 23 | 186 / 104.67 | 부분 이전 |
| [02-priority2-partial.json](02-priority2-partial.json) | 8 / 3 / 0 | 67 (56 서버) | 11 | 90 / 53.11 | 부분 이전 |
| [03-priority3-conditional-full.json](03-priority3-conditional-full.json) | 8 / 3 / 3 | 78 (67 서버) | 0 | 0 / 0.00 | 조건부 전체 이전 |

A/B는 잔류 장비를 대전 랙에 그대로 남긴 JSON이다. C만 대전 15개 랙이 모두 비어 있다. A/B를 대전 폐쇄 완료안으로 해석하면 안 된다.

A는 8랙의 256U 중 HR01 Master 4U를 제외한 252U를 사용할 수 있다. 가장 작은 56대만 골라도 252U를 넘으므로 55대가 대수 상한이고, 실제 배치 55대로 상한을 달성했다. B는 같은 방식으로 348U에서 68대가 불가능하고 67대를 달성했다. C는 434U가 필요하지만 1·2순위 가용 공간은 348U이므로 **최소 86U 추가**가 필요하다. 32U 랙 최소 3개가 필요하고 실제로 3개로 전체 배치했다.

## 3. 장비 대조 — 67대는 확정 실사 수량이 아님

| 연구실 | 입력 JSON 서버 | 엑셀 서버 구성표 대수 | 계획 서버 | 처리 |
|---|---:|---:|---:|---|
| 윤세영 | 4 | 3 | 4 | 구성 미확인 1대 보존 |
| 주재걸 | 18 | 20 | 20 | 엑셀의 추가 2대 포함, 중복/증설 여부 확인 필요 |
| 최윤재 | 8 | 6 | 8 | 구성 미확인 2대 보존 |
| 정송 | 6 | 6 | 6 | 두 수량 일치 |
| 신진우 | 7 | 6 | 7 | 구성 미확인 1대 보존 |
| 최재식 | 11 | 미제공 (GPU 합계만) | 11 | 11개 섀시 보존, GPU 49개를 특정 서버에 임의 분배하지 않음 |
| 김기응 | 11 | 7 | 11 | 구성 미확인 4대 보존 |

계획은 **연구실별 두 자료 중 더 큰 수량**을 유지하는 보수적 상한 시나리오다. 서버 48대는 GPU 구성이 있고, 11대(최재식)는 섀시 수·GPU 합계만 있으며, 나머지 8대는 구성표에 없는 JSON 수량이다. 주재걸 2대는 엑셀 추가분이며 미확인/중복 가능성을 표시했다. 모든 65개 기존 서버 대응 레코드와 2개 추가 레코드가 한 번씩 등장한다. 확정 자산 대장으로 사용하면 안 된다.

엑셀에는 서버별 자산번호/원래 랙이 없어서 상세 구성을 연구실 내 기존 랙 레코드 순서에 대응시켰다. 이는 **식별용 가배정**일 뿐 원래 랙을 검증한 결과가 아니다. 각 항목 `origin.rackMappingVerified`, `possibleRackIds`, `sourceRef`에 이를 남겼다. 추가 2대의 원래 랙은 null이며, 부분 이전 시 잔류분은 해당 연구실 대표 랙에 임시 표시한다. 신진우 비고의 '타 학과 건물 추가 랙'은 수량 미상으로 포함 여부 확인이 필요하고 78대의 완전성 보증 범위 밖이다.

GPU 집계 차이는 전력 계산에도 남겼다. 주재걸 구성표의 RTX3090 58개 등은 GPU 집계와 일치한다. 엑셀의 `RTX 1080Ti`는 `GTX 1080 Ti`로 이름만 정규화했다. 최재식의 RTX PRO 5000 세대·각 GPU의 섀시 배치는 미확인이다.

## 4. 공간·전력 가정

- 모든 대상 랙에 **가용 32U** 가정. 화면의 8×4U 설정을 계획용으로 해석했으며, 랙 실측 결과가 아니다. 기존 Master가 남는 HR01은 이전 장비에 28U만 허용한다.
- 섀시 미상: GPU 8개 구성 8U, 8개 초과 10U, 7개 이하 4U. 신규 10U 섀시 가정도 부품 분할 없이 한 대로 배치했다. JSON 수량만 있는 장비는 명시된 U가 있으면 그 U, 없으면 8U를 확보한다. 이는 보수적 대용치이며 실제 제조사 규격 상한을 보장하지 않는다.
- NAS 4U/0.5kW ×5, Hub 1U/0.2kW ×3, Desktop 8U/1kW ×2, Terminal 4U/0.3kW ×1. 선반·장착·레일·통풍 공간이 충분한지는 현장 확인한다. HR01 Master는 4U/0.8kW를 확보하며 이동하지 않는다.
- GPU 구성이 있는 서버의 계획 AC 최대 = **(GPU별 보드 최대 전력 합계 + 호스트 800W) ÷ PSU 효율 0.90**, W 단위 올림. GPU 한 종류라도 3kW/서버로 일괄 환산하지 않았다. 미확인 서버 19대는 호스트 포함 DC 4.4kW ÷0.90 = 4.889kW/대를 확보한다. 이것은 계획 예비치이지 미확인 장비의 보증 최대치가 아니다.
- GPU 참조값: RTX3090 350W, 3090Ti 450W, A5000 230W, A6000 300W, 2080Ti 260W, RTX3080 350W, TITAN RTX 280W, A100 400W. TITAN X/Xp/V 및 GTX1080Ti는 공식 개별 SKU 확인 없이 300W 보수 대용치를 적용했다. 'max W ×8' 행은 엑셀의 max 값을 사용했다.
- GPU 참조 출처: [NVIDIA 3090/Ti](https://www.nvidia.com/en-gb/geforce/graphics-cards/30-series/rtx-3090-3090ti/), [NVIDIA A5000/A6000 비교](https://www.nvidia.com/en-us/design-visualization/desktop-graphics.md/), [NVIDIA 2080Ti](https://www.nvidia.com/content/nvidiaGDC/zz/en_ZZ/geforce/graphics-cards/rtx-2080-ti.html), [NVIDIA 3080](https://www.nvidia.com/en-us/geforce/graphics-cards/30-series/rtx-3080-3080ti/), [NVIDIA TITAN RTX](https://www.nvidia.cn/content/dam/en-zz/Solutions/titan/documents/titan-rtx-for-creators-us-nvidia-1011126-r6-web.pdf), [NVIDIA A100](https://www.nvidia.com/en-gb/data-center/a100/). A100 400W는 SXM 상단 참조값이며 실제 PCIe/SXM 여부는 미확인이다.
- **사용 가능 전력 예산**은 홍릉 18kW/랙, 양재 24kW/랙을 민감도 가정으로 지정했다. 6대·8대 운영 가이드에 대응하는 시험 예산일 뿐 확인된 차단기·PDU·배선 정격이 아니다. 냉방 용량÷랙 수로 전기 상한을 만들지 않았다. 실제 회로에서 이 사용 가능 예산과 A/B 이중전원, 연속부하 여유·상별 균형이 확인되어야 한다.
- 434U, 계획 AC 최대 **235.90kW**는 불확실분까지 포함한 대전 전량의 보수적 시험 부하다. 엑셀 G열 연구실 추정 최대부하 합계는 **126.12kW**로 더 낮다. 두 수치를 혼용하지 않았고 낮은 값을 근거로 승인하지 않았다.

| 연구실 | 엑셀 GPU kW | 엑셀 서버 kW | 이번 계획 AC kW | 출처 |
|---|---:|---:|---:|---|
| 윤세영 | 6.48 | 8.28 | 14.76 | F3:G3 |
| 주재걸 | 34.40 | 44.20 | 57.19 | F5:G5 |
| 최윤재 | 17.00 | 21.20 | 34.00 | F14:G14 |
| 정송 | 9.23 | 12.23 | 16.17 | F20:G20 |
| 신진우 | 9.50 | 12.70 | 21.56 | F26:G26 |
| 최재식 | 14.37 | 18.57 | 53.78 | F30:G30 |
| 김기응 | 6.54 | 8.94 | 33.05 | F36:G36 |

위 계획 전력에 보조 장비 5.40kW가 별도 추가된다. 엑셀 연구실 최대부하 합계126.12kW도 기존 대전 냉방 설정116kW보다 크므로, 기존 운영이 모든 서버의 동시 최대부하를 보증한다고 볼 수도 없다. 기존 홍릉/양재 장비의 전력은 모델과 실측이 없어 합산 검증하지 않았다.

## 5. C안 목적지별 배치

**기존 홍릉·양재 장비 이동 0대.** HR01 Master는 제자리에 보존한다. '실사용'은 장비별 owner에 기록하며, 원래 명의는 labNominal에 그대로 남긴다. 연구실 혼합 랙은 학과 공용(shared=true)과 구분한다. 아래 U·kW는 HR01의 Master 4U/0.8kW를 포함한 계획 점유다.

| 목적지 | 순위 | 실사용 연구실 · 원래 대전 랙 후보 | 이전 장비 ID | 총 점유 U /32 | 계획 AC 최대 kW |
|---|---:|---|---|---:|---:|
| HR01 | 1 | 최재식 (DJ3 · 4); 윤세영 (DJ9); 김기응 (DJ2) | DJ03-server-1, DJ04-server-4, DJ09-server-2, DJ02-server-7 | 32 | 15.73 |
| HR02 | 1 | 윤세영 (DJ9); 김기응 (DJ2); 최윤재 (DJ14 · 15); 신진우 (DJ13); 주재걸 (DJ5 · 6 · 7 · 8) | DJ09-server-1, DJ02-server-8, DJ15-server-3, DJ13-server-5, DJ08-Nas-5 | 30 | 17.03 |
| HR03 | 1 | 최윤재 (DJ14 · 15); 윤세영 (DJ9); 정송 (DJ1); 주재걸 (DJ5 · 6 · 7 · 8); 최재식 (DJ3 · 4) | DJ15-server-5, DJ09-server-3, DJ01-server-4, DJ06-server-4, DJ03-server-2 | 32 | 17.69 |
| HR04 | 1 | 주재걸 (DJ5 · 6 · 7 · 8); 최윤재 (DJ14 · 15); 최재식 (DJ3 · 4); 김기응 (DJ2) | DJ05-server-7, DJ14-server-2, DJ05-server-2, DJ04-server-5, DJ02-server-4 | 32 | 17.91 |
| HR05 | 1 | 최재식 (DJ3 · 4); 김기응 (DJ2); 주재걸 (DJ5 · 6 · 7 · 8) | DJ04-server-1, DJ02-server-11, DJ07-server-3, DJ07-server-2, DJ02-server-1, DJ03-Nas-9, DJ-unlocated-주재걸-20, DJ03-Hub-7 | 31 | 17.90 |
| HR06 | 1 | 최윤재 (DJ14 · 15); 주재걸 (DJ5 · 6 · 7 · 8); 정송 (DJ1); 최재식 (DJ3 · 4) | DJ15-server-6, DJ08-server-2, DJ06-server-3, DJ01-server-2, DJ03-Hub-8 | 31 | 15.45 |
| YJ31 | 1 | 주재걸 (DJ5 · 6 · 7 · 8); 김기응 (DJ2); 정송 (DJ1); 신진우 (DJ13) | DJ08-server-1, DJ05-server-3, DJ02-server-2, DJ02-server-3, DJ06-server-5, DJ01-server-1, DJ13-server-1 | 32 | 16.90 |
| YJ32 | 1 | 김기응 (DJ2); 주재걸 (DJ5 · 6 · 7 · 8); 윤세영 (DJ9); 최재식 (DJ3 · 4); 양은호 (DJ11) | DJ02-server-9, DJ05-server-6, DJ09-server-4, DJ03-server-3, DJ11-Desktop-2, DJ03-Hub-6 | 31 | 19.87 |
| YJ06 | 2 | 최재식 (DJ3 · 4); 주재걸 (DJ5 · 6 · 7 · 8); 최윤재 (DJ14 · 15) | DJ04-server-3, DJ06-server-2, DJ04-server-6, DJ14-server-1, DJ07-Nas-5 | 32 | 16.61 |
| YJ07 | 2 | 양은호 (DJ11); 주재걸 (DJ5 · 6 · 7 · 8); 신진우 (DJ13); 최윤재 (DJ14 · 15) | DJ11-Desktop-1, DJ05-server-4, DJ13-server-3, DJ15-server-4 | 32 | 11.76 |
| YJ08 | 2 | 김기응 (DJ2); 최재식 (DJ3 · 4); 신진우 (DJ13); 주재걸 (DJ5 · 6 · 7 · 8); 정송 (DJ1) | DJ02-server-5, DJ03-server-4, DJ13-server-6, DJ08-Nas-4, DJ02-server-10, DJ01-server-6, DJ07-server-1 | 30 | 19.61 |
| HR09 | 3 | 최윤재 (DJ14 · 15); 신진우 (DJ13); 주재걸 (DJ5 · 6 · 7 · 8); 예종철 (DJ12) | DJ15-server-1, DJ13-server-4, DJ07-server-4, DJ12-Terminal-1, DJ13-server-7, DJ13-server-2 | 29 | 16.43 |
| HR10 | 3 | 최재식 (DJ3 · 4); 최윤재 (DJ14 · 15); 주재걸 (DJ5 · 6 · 7 · 8) | DJ04-server-2, DJ03-server-5, DJ15-server-2, DJ05-server-5 | 32 | 17.78 |
| HR11 | 3 | 주재걸 (DJ5 · 6 · 7 · 8); 정송 (DJ1); 김기응 (DJ2) | DJ05-server-1, DJ01-server-3, DJ06-server-1, DJ02-server-6, DJ-unlocated-주재걸-19, DJ08-Nas-3, DJ01-server-5 | 32 | 16.01 |

모델·대당 U·대당 전력은 아래 장비 목록의 같은 ID로 확인한다. '원래 랙 후보'는 연구실별 위치 후보이며 특정 GPU 구성과 원래 랙의 일대일 대응은 검증하지 않았다.

## 6. 잔여 공간·기존 배정 영향

| 그룹 | 가용 랙 | C 사용 | 남는 전체 랙 |
|---|---:|---:|---|
| 1순위 | HR01–06, YJ31–32 (8) | 8 | 없음 |
| 2순위 | YJ06–08 (3) | 3 | 없음 |
| 3순위 | HR09–13, HR25 (6) | 3 | **HR12·HR13·HR25** |
| 4순위 | 기존 점유 랙 통합 | 0 | 기존 배치 유지 |

C 사용 14랙의 원래 448U 중 Master 4U와 대전 장비 434U를 제외하면 **10U** 잔여다. 미사용 3순위 3랙의 96U까지 포함하면 대상 공간 잔여는 **106U**다. 실제 예약·방재·통로 공간과 전기 가용성 확인 전 확장 가능량으로 확정할 수 없다.

YJ06(오성준), YJ07–08(한동수)는 임시 점유하며 명의를 변경하지 않는다. YJ31–32의 반환 전 명의 김기응도 유지한다. HR09–11은 입력의 학과 공용 명의와 임시 점유 비고를 보존한다. HR25(서민준)는 사용하지 않는다. 공용 서버 추가 폐기 30대 외에 기존 교수 소유 장비를 폐기/이동하지 않는다.

C의 대전 추가 AC 부하는 홍릉 **151.148kW**, 양재 **84.752kW**다. 현 설정 냉방 316/560kW 안에 들려면, 폐기 후 남아 있는 기존 전체 부하(보조 장비 포함)가 각각 **164.852kW 이하 / 475.248kW 이하**여야 한다. 이는 필요조건이며 냉방 여유·국소 열밀도·전원 용량 검증을 대체하지 않는다.

A에서 전체 이전하려면 현재 허용 범위 밖에 최소 **182U**, B에서는 최소 **86U**의 추가 장비 공간이 필요하다(원 장비434U − 가용252/348U). A의 이전되지 않은 23대는 186U/104.670kW, B의 11대는 90U/53.113kW이며 기존에 남은 작은 공간을 함께 재배치하면 위 하한으로 줄어든다. 필요한 **증설 전력**은 기존 실측 부하와 회로 배치가 없어 확정할 수 없다.

## 7. A/B 목적지별 배치

### A · 1순위 8랙만 사용

| 목적지 | 순위 | 장비 ID (소유자·구성은 목록 참조) | U /32 | AC 최대 kW |
|---|---:|---|---:|---:|
| HR01 | 1 | DJ06-server-4, DJ01-server-4, DJ07-Nas-5, DJ06-server-1, DJ01-server-5, DJ09-server-3 | 32 | 13.88 |
| HR02 | 1 | DJ07-server-3, DJ09-server-1, DJ05-server-7, DJ13-server-3, DJ02-server-7, DJ02-server-2 | 32 | 15.69 |
| HR03 | 1 | DJ13-server-5, DJ-unlocated-주재걸-19, DJ01-server-6, DJ02-server-10, DJ02-server-1, DJ13-server-6, DJ03-Hub-6, DJ03-Hub-7 | 28 | 17.56 |
| HR04 | 1 | DJ01-server-2, DJ07-server-4, DJ15-server-1, DJ06-server-5, DJ09-server-4, DJ08-Nas-3 | 32 | 16.72 |
| HR05 | 1 | DJ-unlocated-주재걸-20, DJ02-server-6, DJ02-server-3, DJ08-Nas-5, DJ06-server-3, DJ07-server-1, DJ08-server-1, DJ03-Nas-9 | 32 | 12.94 |
| HR06 | 1 | DJ15-server-4, DJ02-server-5, DJ09-server-2, DJ05-server-1, DJ06-server-2 | 32 | 14.96 |
| YJ31 | 1 | DJ07-server-2, DJ11-Desktop-1, DJ01-server-3, DJ02-server-4, DJ13-server-4, DJ02-server-9, DJ02-server-11 | 32 | 21.22 |
| YJ32 | 1 | DJ13-server-2, DJ08-Nas-4, DJ02-server-8, DJ12-Terminal-1, DJ01-server-1, DJ13-server-1, DJ11-Desktop-2, DJ03-Hub-8, DJ13-server-7 | 32 | 19.06 |

대전 잔류: DJ05-server-2, DJ05-server-3, DJ05-server-4, DJ05-server-5, DJ05-server-6, DJ08-server-2, DJ14-server-1, DJ14-server-2, DJ15-server-2, DJ15-server-3, DJ03-server-1, DJ03-server-2, DJ03-server-3, DJ03-server-4, DJ03-server-5, DJ04-server-1, DJ04-server-2, DJ04-server-3, DJ04-server-4, DJ04-server-5, DJ04-server-6, DJ15-server-5, DJ15-server-6.

### B · 1·2순위 최대 11랙 사용

| 목적지 | 순위 | 장비 ID (소유자·구성은 목록 참조) | U /32 | AC 최대 kW |
|---|---:|---|---:|---:|
| HR01 | 1 | DJ14-server-1, DJ09-server-4, DJ13-server-7, DJ11-Desktop-2, DJ02-server-7 | 29 | 17.80 |
| HR02 | 1 | DJ13-server-5, DJ15-server-3, DJ06-server-4, DJ05-server-4, DJ07-server-3 | 32 | 16.45 |
| HR03 | 1 | DJ05-server-5, DJ13-server-1, DJ08-Nas-5, DJ06-server-2, DJ12-Terminal-1, DJ05-server-1 | 32 | 13.36 |
| HR04 | 1 | DJ15-server-2, DJ09-server-1, DJ02-server-10, DJ09-server-3, DJ02-server-6, DJ03-Hub-8, DJ03-Hub-6 | 32 | 17.78 |
| HR05 | 1 | DJ05-server-3, DJ03-server-1, DJ05-server-2, DJ01-server-3, DJ02-server-3 | 32 | 17.84 |
| HR06 | 1 | DJ07-Nas-5, DJ-unlocated-주재걸-20, DJ06-server-1, DJ07-server-4, DJ01-server-1, DJ03-Nas-9, DJ02-server-1, DJ02-server-5 | 32 | 13.79 |
| YJ31 | 1 | DJ13-server-3, DJ03-server-3, DJ14-server-2, DJ15-server-4 | 32 | 16.09 |
| YJ32 | 1 | DJ13-server-4, DJ07-server-1, DJ01-server-4, DJ13-server-2, DJ02-server-11, DJ01-server-2, DJ02-server-8 | 32 | 22.94 |
| YJ06 | 2 | DJ03-server-2, DJ11-Desktop-1, DJ01-server-5, DJ-unlocated-주재걸-19, DJ06-server-5, DJ08-server-1 | 32 | 14.51 |
| YJ07 | 2 | DJ02-server-9, DJ05-server-6, DJ13-server-6, DJ15-server-1, DJ01-server-6, DJ07-server-2, DJ03-Hub-7 | 31 | 19.98 |
| YJ08 | 2 | DJ09-server-2, DJ06-server-3, DJ08-Nas-4, DJ05-server-7, DJ02-server-4, DJ02-server-2, DJ08-Nas-3 | 32 | 13.05 |

대전 잔류: DJ08-server-2, DJ03-server-4, DJ03-server-5, DJ04-server-1, DJ04-server-2, DJ04-server-3, DJ04-server-4, DJ04-server-5, DJ04-server-6, DJ15-server-5, DJ15-server-6.

## 8. 장비 목록과 감사 정보

모든 행은 쪼갤 수 없는 1개 장비다. 원래 랙 후보·자료 행·확정 여부는 JSON의 origin/sourceRef/specStatus에 들어 있다. '대조 미완료' 서버는 실제 존재/자산 매칭이 필요한 예비 레코드다.

| 장비 ID | 연구실 | 장비/구성 | 가정 U | 가정 AC 최대 kW | 근거/상태 |
|---|---|---|---:|---:|---|
| DJ-unlocated-주재걸-19 | 주재걸 | TITAN Xp x 2 + GTX 1080 Ti x 2 | 4 | 2.22 | 대전 서버실 세부현황.xlsx 시트1 B12:C12; 추가 2대 중 하나; 원래 랙 미상 |
| DJ-unlocated-주재걸-20 | 주재걸 | TITAN X x 2 | 4 | 1.56 | 대전 서버실 세부현황.xlsx 시트1 B13:C13; 추가 2대 중 하나; 원래 랙 미상 |
| DJ01-server-1 | 정송 | RTX 3090 x 5 | 4 | 2.83 | 대전 서버실 세부현황.xlsx 시트1 B20:C20; gpu_known_chassis_assumed |
| DJ01-server-2 | 정송 | TITAN RTX x 8 | 8 | 3.38 | 대전 서버실 세부현황.xlsx 시트1 B21:C21; gpu_known_chassis_assumed |
| DJ01-server-3 | 정송 | TITAN RTX x 7 | 4 | 3.07 | 대전 서버실 세부현황.xlsx 시트1 B22:C22; gpu_known_chassis_assumed |
| DJ01-server-4 | 정송 | TITAN Xp x 4 | 4 | 2.22 | 대전 서버실 세부현황.xlsx 시트1 B23:C23; gpu_known_chassis_assumed |
| DJ01-server-5 | 정송 | TITAN X x 4 | 4 | 2.22 | 대전 서버실 세부현황.xlsx 시트1 B24:C24; gpu_known_chassis_assumed |
| DJ01-server-6 | 정송 | RTX 3080 x 4 | 4 | 2.44 | 대전 서버실 세부현황.xlsx 시트1 B25:C25; gpu_known_chassis_assumed |
| DJ02-server-1 | 김기응 | RTX 3090 x 1 + RTX 3090 Ti x 1 | 4 | 1.78 | 대전 서버실 세부현황.xlsx 시트1 B36:C36; gpu_known_chassis_assumed |
| DJ02-server-10 | 김기응 | 서버 구성 미확인 — 원본 JSON 수량 보존 | 2 | 4.89 | 첨부 JSON 대전-2; snapshot_only_unreconciled |
| DJ02-server-11 | 김기응 | 서버 구성 미확인 — 원본 JSON 수량 보존 | 2 | 4.89 | 첨부 JSON 대전-2; snapshot_only_unreconciled |
| DJ02-server-2 | 김기응 | RTX 3090 x 1 + RTX 3090 Ti x 1 | 4 | 1.78 | 대전 서버실 세부현황.xlsx 시트1 B36:C36; gpu_known_chassis_assumed |
| DJ02-server-3 | 김기응 | RTX 3090 Ti x 2 | 4 | 1.89 | 대전 서버실 세부현황.xlsx 시트1 B37:C37; gpu_known_chassis_assumed |
| DJ02-server-4 | 김기응 | TITAN RTX x 4 | 4 | 2.13 | 대전 서버실 세부현황.xlsx 시트1 B38:C38; gpu_known_chassis_assumed |
| DJ02-server-5 | 김기응 | TITAN RTX x 4 | 4 | 2.13 | 대전 서버실 세부현황.xlsx 시트1 B38:C38; gpu_known_chassis_assumed |
| DJ02-server-6 | 김기응 | RTX A6000 x 2 | 4 | 1.56 | 대전 서버실 세부현황.xlsx 시트1 B39:C39; gpu_known_chassis_assumed |
| DJ02-server-7 | 김기응 | A100 x 3 | 4 | 2.22 | 대전 서버실 세부현황.xlsx 시트1 B40:C40; gpu_known_chassis_assumed |
| DJ02-server-8 | 김기응 | 서버 구성 미확인 — 원본 JSON 수량 보존 | 2 | 4.89 | 첨부 JSON 대전-2; snapshot_only_unreconciled |
| DJ02-server-9 | 김기응 | 서버 구성 미확인 — 원본 JSON 수량 보존 | 2 | 4.89 | 첨부 JSON 대전-2; snapshot_only_unreconciled |
| DJ03-Hub-6 | 최재식 | Hub (모델 미상) | 1 | 0.20 | 첨부 JSON 대전-3; assumed_auxiliary |
| DJ03-Hub-7 | 최재식 | Hub (모델 미상) | 1 | 0.20 | 첨부 JSON 대전-3; assumed_auxiliary |
| DJ03-Hub-8 | 최재식 | Hub (모델 미상) | 1 | 0.20 | 첨부 JSON 대전-3; assumed_auxiliary |
| DJ03-Nas-9 | 최재식 | Nas (모델 미상) | 4 | 0.50 | 첨부 JSON 대전-3; assumed_auxiliary |
| DJ03-server-1 | 최재식 | 서버 구성 미확인 — 원본 JSON 수량 보존 | 8 | 4.89 | 첨부 JSON 대전-3; gpu_aggregate_only |
| DJ03-server-2 | 최재식 | 서버 구성 미확인 — 원본 JSON 수량 보존 | 8 | 4.89 | 첨부 JSON 대전-3; gpu_aggregate_only |
| DJ03-server-3 | 최재식 | 서버 구성 미확인 — 원본 JSON 수량 보존 | 8 | 4.89 | 첨부 JSON 대전-3; gpu_aggregate_only |
| DJ03-server-4 | 최재식 | 서버 구성 미확인 — 원본 JSON 수량 보존 | 8 | 4.89 | 첨부 JSON 대전-3; gpu_aggregate_only |
| DJ03-server-5 | 최재식 | 서버 구성 미확인 — 원본 JSON 수량 보존 | 8 | 4.89 | 첨부 JSON 대전-3; gpu_aggregate_only |
| DJ04-server-1 | 최재식 | 서버 구성 미확인 — 원본 JSON 수량 보존 | 8 | 4.89 | 첨부 JSON 대전-4; gpu_aggregate_only |
| DJ04-server-2 | 최재식 | 서버 구성 미확인 — 원본 JSON 수량 보존 | 8 | 4.89 | 첨부 JSON 대전-4; gpu_aggregate_only |
| DJ04-server-3 | 최재식 | 서버 구성 미확인 — 원본 JSON 수량 보존 | 8 | 4.89 | 첨부 JSON 대전-4; gpu_aggregate_only |
| DJ04-server-4 | 최재식 | 서버 구성 미확인 — 원본 JSON 수량 보존 | 8 | 4.89 | 첨부 JSON 대전-4; gpu_aggregate_only |
| DJ04-server-5 | 최재식 | 서버 구성 미확인 — 원본 JSON 수량 보존 | 8 | 4.89 | 첨부 JSON 대전-4; gpu_aggregate_only |
| DJ04-server-6 | 최재식 | 서버 구성 미확인 — 원본 JSON 수량 보존 | 8 | 4.89 | 첨부 JSON 대전-4; gpu_aggregate_only |
| DJ05-server-1 | 주재걸 | RTX 3090 x 8 | 8 | 4.00 | 대전 서버실 세부현황.xlsx 시트1 B5:C5; gpu_known_chassis_assumed |
| DJ05-server-2 | 주재걸 | RTX 3090 x 8 | 8 | 4.00 | 대전 서버실 세부현황.xlsx 시트1 B5:C5; gpu_known_chassis_assumed |
| DJ05-server-3 | 주재걸 | RTX 3090 x 8 | 8 | 4.00 | 대전 서버실 세부현황.xlsx 시트1 B5:C5; gpu_known_chassis_assumed |
| DJ05-server-4 | 주재걸 | RTX 3090 x 8 | 8 | 4.00 | 대전 서버실 세부현황.xlsx 시트1 B5:C5; gpu_known_chassis_assumed |
| DJ05-server-5 | 주재걸 | RTX 3090 x 8 | 8 | 4.00 | 대전 서버실 세부현황.xlsx 시트1 B5:C5; gpu_known_chassis_assumed |
| DJ05-server-6 | 주재걸 | RTX 3090 x 8 | 8 | 4.00 | 대전 서버실 세부현황.xlsx 시트1 B5:C5; gpu_known_chassis_assumed |
| DJ05-server-7 | 주재걸 | RTX 3090 x 4 | 4 | 2.44 | 대전 서버실 세부현황.xlsx 시트1 B6:C6; gpu_known_chassis_assumed |
| DJ06-server-1 | 주재걸 | RTX 3090 x 4 | 4 | 2.44 | 대전 서버실 세부현황.xlsx 시트1 B6:C6; gpu_known_chassis_assumed |
| DJ06-server-2 | 주재걸 | RTX 3090 x 2 + TITAN Xp x 1 + TITAN V JHH Special Edition x 1 | 4 | 2.33 | 대전 서버실 세부현황.xlsx 시트1 B7:C7; gpu_known_chassis_assumed |
| DJ06-server-3 | 주재걸 | TITAN RTX x 6 | 4 | 2.76 | 대전 서버실 세부현황.xlsx 시트1 B8:C8; gpu_known_chassis_assumed |
| DJ06-server-4 | 주재걸 | TITAN RTX x 6 | 4 | 2.76 | 대전 서버실 세부현황.xlsx 시트1 B8:C8; gpu_known_chassis_assumed |
| DJ06-server-5 | 주재걸 | TITAN RTX x 4 | 4 | 2.13 | 대전 서버실 세부현황.xlsx 시트1 B9:C9; gpu_known_chassis_assumed |
| DJ07-Nas-5 | 주재걸 | Nas (모델 미상) | 4 | 0.50 | 첨부 JSON 대전-7; assumed_auxiliary |
| DJ07-server-1 | 주재걸 | TITAN RTX x 4 | 4 | 2.13 | 대전 서버실 세부현황.xlsx 시트1 B9:C9; gpu_known_chassis_assumed |
| DJ07-server-2 | 주재걸 | RTX 2080 Ti x 4 | 4 | 2.04 | 대전 서버실 세부현황.xlsx 시트1 B10:C10; gpu_known_chassis_assumed |
| DJ07-server-3 | 주재걸 | RTX 2080 Ti x 4 | 4 | 2.04 | 대전 서버실 세부현황.xlsx 시트1 B10:C10; gpu_known_chassis_assumed |
| DJ07-server-4 | 주재걸 | RTX 2080 Ti x 4 | 4 | 2.04 | 대전 서버실 세부현황.xlsx 시트1 B10:C10; gpu_known_chassis_assumed |
| DJ08-Nas-3 | 주재걸 | Nas (모델 미상) | 4 | 0.50 | 첨부 JSON 대전-8; assumed_auxiliary |
| DJ08-Nas-4 | 주재걸 | Nas (모델 미상) | 4 | 0.50 | 첨부 JSON 대전-8; assumed_auxiliary |
| DJ08-Nas-5 | 주재걸 | Nas (모델 미상) | 4 | 0.50 | 첨부 JSON 대전-8; assumed_auxiliary |
| DJ08-server-1 | 주재걸 | RTX 2080 Ti x 4 | 4 | 2.04 | 대전 서버실 세부현황.xlsx 시트1 B10:C10; gpu_known_chassis_assumed |
| DJ08-server-2 | 주재걸 | TITAN Xp x 10 | 10 | 4.22 | 대전 서버실 세부현황.xlsx 시트1 B11:C11; gpu_known_chassis_assumed |
| DJ09-server-1 | 윤세영 | RTX 3090 x 8 | 8 | 4.00 | 대전 서버실 세부현황.xlsx 시트1 B3:C3; gpu_known_chassis_assumed |
| DJ09-server-2 | 윤세영 | RTX A5000 x 8 | 8 | 2.93 | 대전 서버실 세부현황.xlsx 시트1 B4:C4; gpu_known_chassis_assumed |
| DJ09-server-3 | 윤세영 | RTX A5000 x 8 | 8 | 2.93 | 대전 서버실 세부현황.xlsx 시트1 B4:C4; gpu_known_chassis_assumed |
| DJ09-server-4 | 윤세영 | 서버 구성 미확인 — 원본 JSON 수량 보존 | 4 | 4.89 | 첨부 JSON 대전-9; snapshot_only_unreconciled |
| DJ11-Desktop-1 | 양은호 | Desktop (모델 미상) | 8 | 1.00 | 첨부 JSON 대전-11; assumed_auxiliary |
| DJ11-Desktop-2 | 양은호 | Desktop (모델 미상) | 8 | 1.00 | 첨부 JSON 대전-11; assumed_auxiliary |
| DJ12-Terminal-1 | 예종철 | Terminal (모델 미상) | 4 | 0.30 | 첨부 JSON 대전-12; assumed_auxiliary |
| DJ13-server-1 | 신진우 | TITAN Xp x 4 | 4 | 2.22 | 대전 서버실 세부현황.xlsx 시트1 B26:C26; gpu_known_chassis_assumed |
| DJ13-server-2 | 신진우 | TITAN X x 4 | 4 | 2.22 | 대전 서버실 세부현황.xlsx 시트1 B27:C27; gpu_known_chassis_assumed |
| DJ13-server-3 | 신진우 | RTX 2080 Ti x 8 | 8 | 3.20 | 대전 서버실 세부현황.xlsx 시트1 B28:C28; gpu_known_chassis_assumed |
| DJ13-server-4 | 신진우 | RTX 2080 Ti x 8 | 8 | 3.20 | 대전 서버실 세부현황.xlsx 시트1 B28:C28; gpu_known_chassis_assumed |
| DJ13-server-5 | 신진우 | RTX 2080 Ti x 8 | 8 | 3.20 | 대전 서버실 세부현황.xlsx 시트1 B28:C28; gpu_known_chassis_assumed |
| DJ13-server-6 | 신진우 | RTX 2080 Ti x 6 | 4 | 2.62 | 대전 서버실 세부현황.xlsx 시트1 B29:C29; gpu_known_chassis_assumed |
| DJ13-server-7 | 신진우 | 서버 구성 미확인 — 원본 JSON 수량 보존 | 1 | 4.89 | 첨부 JSON 대전-13; snapshot_only_unreconciled |
| DJ14-server-1 | 최윤재 | 280W (max 350W) x 8 | 8 | 4.00 | 대전 서버실 세부현황.xlsx 시트1 B14:C14; gpu_known_chassis_assumed |
| DJ14-server-2 | 최윤재 | 320W (max 400W) x 8 | 8 | 4.45 | 대전 서버실 세부현황.xlsx 시트1 B15:C15; gpu_known_chassis_assumed |
| DJ15-server-1 | 최윤재 | 280W (max 325W) x 8 | 8 | 3.78 | 대전 서버실 세부현황.xlsx 시트1 B16:C16; gpu_known_chassis_assumed |
| DJ15-server-2 | 최윤재 | 280W (max 350W) x 8 | 8 | 4.00 | 대전 서버실 세부현황.xlsx 시트1 B17:C17; gpu_known_chassis_assumed |
| DJ15-server-3 | 최윤재 | 320W (max 400W) x 8 | 8 | 4.45 | 대전 서버실 세부현황.xlsx 시트1 B18:C18; gpu_known_chassis_assumed |
| DJ15-server-4 | 최윤재 | 280W (max 300W) x 8 | 8 | 3.56 | 대전 서버실 세부현황.xlsx 시트1 B19:C19; gpu_known_chassis_assumed |
| DJ15-server-5 | 최윤재 | 서버 구성 미확인 — 원본 JSON 수량 보존 | 8 | 4.89 | 첨부 JSON 대전-15; snapshot_only_unreconciled |
| DJ15-server-6 | 최윤재 | 서버 구성 미확인 — 원본 JSON 수량 보존 | 8 | 4.89 | 첨부 JSON 대전-15; snapshot_only_unreconciled |

## 9. 검증·재현·가져오기

- 현재 `server-status/index.html`의 **실제 normalizeWorkspace 함수**를 메모리에서 실행해 세 JSON을 검증했다. React 실행·브라우저 저장·운영 현황 덮어쓰기는 하지 않았다. JSON 직렬화 후 재검증도 통과했다.
- 72개 랙 키·모든 labNominal·사용자 settings·plans 유지, 무관한 랙 완전 동일, 대전 78개 고유 장비 ID 누락/중복 없음, 비서버 총수 보존, 전체 서버 수는 입력289대 −공용30대 +대조추가2대 = **261대**를 확인했다. C 대전 빈 랙15개, A/B 잔류 보존, 모든 목적지 32U·임시 전력 예산 준수를 확인했다.
- 재현 규칙: 연구실별 상세 구성은 엑셀 행 순서로 기존 서버 레코드에 가대응, 남은 기존 수량을 미확인분으로 보존, 추가 구성은 별도 ID. 부분안은 작은 U→작은 전력 순으로 대수 상한만큼 선택. 고정 시드77의 배치 탐색으로 적합한 랙 조합을 찾았으며, 대수 상한과 C 3순위 랙 수 하한을 별도로 검증했다.
- 계획 JSON에는 전체 현황과 `migration` 메타데이터가 포함된다. 이 메타데이터는 현 페이지에서 별도 기능으로 표시되지 않으며, 페이지에서 다시 내보내면 최상위 migration 필드는 빠질 수 있다. **원본 결과 파일과 보고서를 함께 보관**한다. 항목별 model/origin/estimatedU/estimatedMaxPowerW와 랙 비고는 현 데이터에 남는다.
- 페이지의 슬롯 그림·냉방 경고는 여전히 서버 대수와 기존 설정4/6/2.5 및8슬롯을 사용한다. **본 보고서의 실제 U 가정·모델별 전력 검증 화면이 아니다.** 8대 초과 경고가 떠도 작은 장비 조합은32U안에 들어갈 수 있으며, 반대로 서버8대라도8U모델이면 불가능하다. 설정을 바꾸어 경고를 숨기지 않았다.
- 로드 전 현재 현황을 JSON으로 백업하고, 원하는 전략 파일 한 개를 JSON 불러오기로 연다. A/B/C는 서로 이어지는 패치가 아니라 동일 기준의 독립된 전체 스냅샷이다.

현장 확인 우선순위: 대조 수량·자산ID → 실제 섀시 모델/U·깊이·무게·레일 → 실제 가용 U/선반 → 차단기/PDU/상별 여유 및 기존 부하 → 냉방 실효 용량·국소 온도 → 네트워크·스토리지 연결 및 이전 순서. 확인 전에는 C를 '실행 승인 완료'가 아닌 **전체 이전 가능성을 검토할 구체적 후보안**으로 사용한다.
