# assets — 에셋 파일명 가이드

기업 제공 에셋이 들어갈 자리입니다. **아래 파일명 그대로** 각 폴더에 넣으면 코드가 인식합니다.
(에셋 도착 후 `js/menu-data.js`·`index.html`의 placeholder를 해당 경로로 연결)

## 폴더 / 파일명

```
assets/
├─ logo/
│   └─ logo.svg          # 로고 — 1순위 벡터(SVG). 없으면 logo.png (고해상도·투명배경)
│                        #   권장: 높이 60px 기준, 가로 비율 자유
├─ banner/                          # (모든 이미지 .png)
│   ├─ banner-blind.png  # 메인배너 '공개 전' (768×360)  ← 업로드됨
│   └─ banner.png        # 메인배너 '공개 후'(7/21 18:00) (768×360)
├─ menu/                  # 메뉴별 이미지(.png) · 번호-이름: 1-hyeonbin 2-yoon 3-yeonwoo 4-jinhyuk 5-siyun
│   ├─ blind/                   # 공개 전 블라인드 (업로드 완료)
│   │   ├─ preview{N}-{이름}-blind.png   # 홈 미리보기 블라인드 (240×300)
│   │   ├─ thumb{N}-{이름}-blind.png     # 썸네일 블라인드 (240×240)
│   │   └─ detail{N}-{이름}-blind.png    # 상세 블라인드 (840×600)
│   │        예) preview1-hyeonbin-blind.png, thumb3-yeonwoo-blind.png
│   └─ open/                    # 공개 후 이미지(7/21 18:00) — 공개 직전 '이 폴더'에 업로드
│       ├─ preview{N}-{이름}.png    #   홈 미리보기 (240×300 세로)
│       ├─ thumb{N}-{이름}.png      #   메뉴 전체보기 썸네일 (240×240 정사각)
│       └─ detail{N}-{이름}.png     #   단일 메뉴 상세 상단 (840×600 가로)
│            예) preview1-hyeonbin.png, thumb3-yeonwoo.png, detail5-siyun.png
├─ track/
│   └─ track.png         # 배달현황 단일 이미지 (전환 없음, 840×480)  ← 업로드됨
├─ ad/
│   └─ ad.png            # 메뉴페이지 광고 배너 (768×192, 선택)
└─ icons/                # ※ 아이콘: 현재 이모지 사용 중. 커스텀 SVG로 교체 예정(기업 협의 후 확정)
    ├─ home.svg          #   (예정) 홈 탭
    ├─ delivery.svg      #   (예정) 배달현황 탭
    └─ share.svg         #   (예정) 공유 버튼
```

## 크기·형식 요약

| 에셋 | 권장 크기 | 형식 |
| --- | --- | --- |
| 로고 | 높이 60px 기준 | **SVG**(우선) / PNG(투명) |
| 컴백 배너 | 768 × 360 | PNG |
| 메뉴 미리보기(preview) | 240 × 300 세로 | PNG |
| 메뉴 썸네일(thumb) | 240 × 240 정사각 | PNG |
| 메뉴 상세(detail) | 840 × 600 가로 | PNG |
| 배달현황(track) | 840 × 480 | PNG |
| 광고 배너 | 768 × 192 | PNG |
| 아이콘 | 벡터 | **SVG** (예정) |

## 이미지 개수 요약
- **공개 후 15장** = preview·thumb·detail × 5메뉴  (+ 메인배너 banner.png 1장) → **7/21 직전 업로드 예정**
- **블라인드(공개 전) 15장** = preview·thumb·detail 블라인드 × 5메뉴  (+ banner-blind.png) → **업로드 완료**
- 배달현황 track.png 1장, 로고, (광고배너 선택)

## 참고
- 공개 전엔 메뉴 이미지(미리보기/썸네일/상세) + 메인배너가 **블라인드**, 7/21(화) 18:00(서버시간)에 **일괄 공개**.
- 공개 후 이미지(`preview/thumb/detail{1-5}.png`, `banner.png`)는 아직 없어 현재는 블라인드 표시 중. 7/21 직전 업로드하면 그 시각에 자동 전환.
- 사진은 PNG(또는 JPG). SVG는 로고·아이콘·단순 그래픽에만.
