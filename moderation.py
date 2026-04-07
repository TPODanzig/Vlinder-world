import cv2
import numpy as np
import base64
import sys
from dataclasses import dataclass


@dataclass
class ModerationResult:
    safe: bool
    reason: str | None


def check_image(data_url: str) -> ModerationResult:
    image = _decode_image(data_url)
    if image is None:
        return ModerationResult(safe=True, reason=None)

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    binary = _binarize(gray)

    checks = [
        _check_swastika,
        _check_genitalia,
        _check_letter_h,
    ]

    for check in checks:
        result = check(image, gray, binary)
        if result is not None:
            return ModerationResult(safe=False, reason=result)

    return ModerationResult(safe=True, reason=None)


def _decode_image(data_url: str) -> np.ndarray | None:
    try:
        if "," in data_url:
            data_url = data_url.split(",", 1)[1]
        img_bytes = base64.b64decode(data_url)
        arr = np.frombuffer(img_bytes, dtype=np.uint8)
        return cv2.imdecode(arr, cv2.IMREAD_COLOR)
    except Exception:
        return None


def _binarize(gray: np.ndarray) -> np.ndarray:
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    _, binary = cv2.threshold(blurred, 240, 255, cv2.THRESH_BINARY_INV)
    return binary


def _get_contours(binary: np.ndarray):
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    return sorted(contours, key=cv2.contourArea, reverse=True)


def _check_swastika(image, gray, binary) -> str | None:
    contours = _get_contours(binary)

    for contour in contours:
        area = cv2.contourArea(contour)
        if area < 1000:
            continue

        x, y, w, h = cv2.boundingRect(contour)
        aspect = w / h if h > 0 else 0
        if not (0.6 < aspect < 1.6):
            continue

        epsilon = 0.02 * cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, epsilon, True)
        corners = len(approx)

        if not (10 <= corners <= 16):
            continue

        hull = cv2.convexHull(contour)
        hull_area = cv2.contourArea(hull)
        if hull_area == 0:
            continue
        solidity = area / hull_area

        if not (0.45 < solidity < 0.80):
            continue

        M = cv2.moments(contour)
        if M["m00"] == 0:
            continue

        hu = cv2.HuMoments(M).flatten()
        if abs(hu[2]) > 0.05:
            continue

        return "potential hate symbol detected"

    return None


def _check_genitalia(image, gray, binary) -> str | None:
    contours = _get_contours(binary)
    meaningful = [c for c in contours if cv2.contourArea(c) > 800]

    for contour in meaningful:
        area = cv2.contourArea(contour)
        perimeter = cv2.arcLength(contour, True)
        if perimeter == 0:
            continue

        x, y, w, h = cv2.boundingRect(contour)
        aspect = max(w, h) / min(w, h) if min(w, h) > 0 else 0
        circularity = (4 * np.pi * area) / (perimeter ** 2)

        hull = cv2.convexHull(contour)
        hull_area = cv2.contourArea(hull)
        solidity = area / hull_area if hull_area > 0 else 0

        if aspect > 2.0 and 0.6 < solidity < 0.98 and circularity > 0.2:
            if len(contour) >= 5:
                ellipse = cv2.fitEllipse(contour)
                (_, _), (minor, major), _ = ellipse
                ellipse_ratio = minor / major if major > 0 else 0
                if ellipse_ratio < 0.5:
                    return "potentially explicit content detected"

        if 0.6 < circularity < 1.0 and 0.7 < solidity < 0.97 and aspect < 2.0:
            hull_indices = cv2.convexHull(contour, returnPoints=False)
            if hull_indices is not None and len(hull_indices) > 3 and len(contour) > 3:
                try:
                    defects = cv2.convexityDefects(contour, hull_indices)
                    if defects is not None:
                        deep_defects = [
                            d for d in defects[:, 0]
                            if d[3] / 256.0 > 10
                        ]
                        if 1 <= len(deep_defects) <= 3:
                            return "potentially explicit content detected"
                except cv2.error:
                    pass

    return None


def _check_letter_h(image, gray, binary) -> str | None:
    contours = _get_contours(binary)

    for contour in contours:
        area = cv2.contourArea(contour)
        if area < 500:
            continue

        x, y, w, h = cv2.boundingRect(contour)
        aspect = h / w if w > 0 else 0

        if aspect < 1.0:
            continue

        epsilon = 0.02 * cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, epsilon, True)
        corners = len(approx)

        if not (8 <= corners <= 16):
            continue

        hull = cv2.convexHull(contour)
        hull_area = cv2.contourArea(hull)
        solidity = area / hull_area if hull_area > 0 else 0

        if not (0.45 < solidity < 0.75):
            continue

        mask = np.zeros_like(binary)
        cv2.drawContours(mask, [contour], -1, 255, -1)

        left_half = mask[y:y+h, x:x + w//2]
        right_half = mask[y:y+h, x + w//2:x+w]

        left_pixels = np.sum(left_half > 0)
        right_pixels = np.sum(right_half > 0)

        if left_pixels == 0 or right_pixels == 0:
            continue

        symmetry_ratio = min(left_pixels, right_pixels) / max(left_pixels, right_pixels)

        if symmetry_ratio > 0.75:
            return "potential hate symbol detected"

    return None


# ---------------------------------------------------------------------------
# Entry point — called by Node.js via child_process
# Output is exactly: SAFE or UNSAFE:<reason>
# For manual testing: python moderation.py <path_to_image.png>
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("SAFE")
        sys.exit(0)

    arg = sys.argv[1]

    if arg.startswith("data:"):
        result = check_image(arg)
    else:
        with open(arg, "rb") as f:
            b64 = base64.b64encode(f.read()).decode()
        result = check_image(f"data:image/png;base64,{b64}")

    if result.safe:
        print("SAFE")
    else:
        print(f"UNSAFE:{result.reason}")