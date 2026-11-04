import React, { useState, useEffect, useRef } from 'react';
import {
  Store,
  Save,
  CheckCircle,
  Upload,
  Image,
  Trash2,
  Camera,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Landmark
} from 'lucide-react';
import { URLS } from '../url';

const EMPTY_PROFILE = {
  restaurantName: '',
  contactNumber: '',
  address: '',
  dailyOpenTime: '',
  dailyClosedTime: '',
  taxpayerId1: '',
  taxpayerId2: '',
  tinNumber: '',
  tinNumberTwo: '',
  tinExpiryDate: '',
  tinExpiryTwoDate: '',
  principalOwnerName: '',
  ownerDirectNumber: '',
  platformCommission: '',
  estimatedDeliveryTime: '',
  accountNumber: '',
  bankName: '',
  branchName: '',
  ifscCode: '',
  accountHolderName: '',
};

const CACHE_KEY = 'restaurant_profile_cache';

/** Full last-known-good profile so hard refresh never blanks the form */
const loadCache = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    if (!raw || typeof raw !== 'object') return null;
    return raw;
  } catch {
    return null;
  }
};

const saveCache = (payload) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
};

/** Pick the richest object from the GET/PUT payload (avoid empty `{}` data). */
const extractProfilePayload = (result) => {
  if (!result || typeof result !== 'object') return {};

  const candidates = [
    result.data,
    result.data?.restaurant,
    result.data?.profile,
    result.data?.user,
    result.restaurant,
    result.profile,
    result.user,
    result
  ].filter((c) => c && typeof c === 'object' && !Array.isArray(c));

  const score = (obj) => {
    let n = 0;
    if (obj.restaurentName || obj.restaurantName) n += 5;
    if (obj.phone || obj.contactNumber) n += 3;
    if (obj.address || obj.restaurentAddress) n += 2;
    if (obj.dailyOpenTime || obj.dailyCloseTime) n += 2;
    if (obj.tinNumber || obj.ownerPhone) n += 2;
    if (obj.restaurentLogo || obj.restaurentCover) n += 2;
    if (Array.isArray(obj.images) && obj.images.length) n += 2;
    if (obj._id || obj.email) n += 1;
    return n;
  };

  return candidates.sort((a, b) => score(b) - score(a))[0] || {};
};

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [bannerUrl, setBannerUrl] = useState(null);
  const [logoUrl, setLogoUrl] = useState(null);
  const [gallery, setGallery] = useState([]);

  const [bannerFile, setBannerFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [tinCertFile, setTinCertFile] = useState(null);
  const [tinCertName, setTinCertName] = useState('');
  const [tinCertPath, setTinCertPath] = useState(null);
  const [tinCertDataUrl, setTinCertDataUrl] = useState(null);
  const [licenseDocFile, setLicenseDocFile] = useState(null);
  const [licenseDocName, setLicenseDocName] = useState('');
  const [licenseDocPath, setLicenseDocPath] = useState(null);
  const [licenseDocDataUrl, setLicenseDocDataUrl] = useState(null);

  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const profileRef = useRef(profile);
  profileRef.current = profile;

  const isLocalPreview = (url) =>
    Boolean(url && (String(url).startsWith('blob:') || String(url).startsWith('data:')));

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      if (!file) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  const getImageUrl = (imagePath) => {
    if (!imagePath || typeof imagePath !== 'string') return null;
    const trimmed = imagePath.trim();
    if (!trimmed) return null;
    if (
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('blob:') ||
      trimmed.startsWith('data:')
    ) {
      return trimmed;
    }

    const clean = trimmed.replace(/\\/g, '/').replace(/^\/+/, '');
    const base = (URLS.Image || URLS.Base || 'http://40.192.68.118:3000/').replace(/\/?$/, '/');
    return encodeURI(`${base}${clean}`);
  };

  const fileNameFromPath = (path) => {
    if (!path || typeof path !== 'string') return '';
    return path.replace(/\\/g, '/').split('/').pop() || '';
  };

  const parseApiError = (result, fallback = 'Request failed.') => {
    if (!result) return fallback;
    if (typeof result.message === 'string' && result.message.trim()) return result.message;
    if (typeof result.error === 'string' && result.error.trim()) return result.error;
    if (Array.isArray(result.errors) && result.errors.length) {
      return result.errors
        .map((e) => (typeof e === 'string' ? e : e?.msg || e?.message || JSON.stringify(e)))
        .join(' · ');
    }
    return fallback;
  };

  const pick = (apiVal, prevVal) => {
    if (apiVal !== undefined && apiVal !== null && String(apiVal).trim() !== '') {
      return String(apiVal);
    }
    return prevVal || '';
  };

  const mapProfileData = (data = {}, previous = EMPTY_PROFILE) => {
    const ownerFromApi =
      data.ownerName ||
      [data.ownerFirstName, data.ownerLastName].filter(Boolean).join(' ').trim();

    return {
      restaurantName: pick(data.restaurentName || data.restaurantName, previous.restaurantName),
      contactNumber: pick(data.phone || data.contactNumber, previous.contactNumber),
      address: pick(data.address || data.restaurentAddress, previous.address),
      dailyOpenTime: pick(data.dailyOpenTime, previous.dailyOpenTime),
      dailyClosedTime: pick(data.dailyCloseTime || data.dailyClosedTime, previous.dailyClosedTime),
      taxpayerId1: pick(
        data['Taxpayer Identification No 1'] || data.taxpayerIdentificationNo1,
        previous.taxpayerId1
      ),
      taxpayerId2: pick(
        data['Taxpayer Identification No 2'] || data.taxpayerIdentificationNo2,
        previous.taxpayerId2
      ),
      tinNumber: pick(data.tinNumber, previous.tinNumber),
      tinNumberTwo: pick(data.tinNumberTwo, previous.tinNumberTwo),
      tinExpiryDate: pick(data.tinExpiryDate, previous.tinExpiryDate),
      tinExpiryTwoDate: pick(
        data.tinnumberTwoDate || data.tinNumberTwoDate,
        previous.tinExpiryTwoDate
      ),
      principalOwnerName: pick(ownerFromApi, previous.principalOwnerName),
      ownerDirectNumber: pick(data.ownerPhone || data.ownerDirectNumber, previous.ownerDirectNumber),
      platformCommission: pick(data.platformCommission, previous.platformCommission),
      estimatedDeliveryTime: pick(
        data.estimatedDeliveryTime ||
        data.estimatedDeliveryMinutes ||
        data.estimatedDeliveryMinimumTime,
        previous.estimatedDeliveryTime
      )

    };
  };

  const persistSnapshot = (nextProfile, media = {}) => {
    const prev = loadCache() || {};
    saveCache({
      profile: nextProfile,
      bannerPath: media.bannerPath ?? prev.bannerPath ?? null,
      logoPath: media.logoPath ?? prev.logoPath ?? null,
      // data URLs survive refresh (server /uploads currently 404s)
      bannerDataUrl: media.bannerDataUrl ?? prev.bannerDataUrl ?? null,
      logoDataUrl: media.logoDataUrl ?? prev.logoDataUrl ?? null,
      tinCertName: media.tinCertName ?? prev.tinCertName ?? '',
      tinCertPath: media.tinCertPath ?? prev.tinCertPath ?? null,
      tinCertDataUrl: media.tinCertDataUrl ?? prev.tinCertDataUrl ?? null,
      licenseDocName: media.licenseDocName ?? prev.licenseDocName ?? '',
      licenseDocPath: media.licenseDocPath ?? prev.licenseDocPath ?? null,
      licenseDocDataUrl: media.licenseDocDataUrl ?? prev.licenseDocDataUrl ?? null,
      galleryPaths: media.galleryPaths ?? prev.galleryPaths ?? [],
      galleryDataUrls: media.galleryDataUrls ?? prev.galleryDataUrls ?? []
    });
  };

  /** Prefer lasting data-URL cache over server paths (uploads often 404). */
  const resolveDisplayUrl = (serverPath, cachedDataUrl, keepLocalPreviews) => {
    return (prev) => {
      if (keepLocalPreviews && isLocalPreview(prev)) return prev;
      if (cachedDataUrl) return cachedDataUrl;
      const remote = getImageUrl(serverPath);
      return remote || prev || null;
    };
  };

  /** Merge media from API — never wipe local/cached previews */
  const applyMediaFromData = (data = {}, { keepLocalPreviews = false, cached = null } = {}) => {
    const coverPath =
      data.restaurentCover || data.restaurantCover || cached?.bannerPath || null;
    const logoPath =
      data.restaurentLogo ||
      data.restaurantLogo ||
      data.profileImage ||
      cached?.logoPath ||
      null;

    setBannerUrl(
      resolveDisplayUrl(coverPath, cached?.bannerDataUrl, keepLocalPreviews)
    );
    setLogoUrl(
      resolveDisplayUrl(logoPath, cached?.logoDataUrl, keepLocalPreviews)
    );

    if (data.tinCertificate) {
      setTinCertName(fileNameFromPath(data.tinCertificate));
      setTinCertPath(data.tinCertificate);
    } else if (cached?.tinCertName || cached?.tinCertPath) {
      setTinCertName(cached.tinCertName || fileNameFromPath(cached.tinCertPath));
      setTinCertPath(cached.tinCertPath || null);
    }
    if (cached?.tinCertDataUrl) setTinCertDataUrl(cached.tinCertDataUrl);

    if (data.licenseDocument) {
      setLicenseDocName(fileNameFromPath(data.licenseDocument));
      setLicenseDocPath(data.licenseDocument);
    } else if (cached?.licenseDocName || cached?.licenseDocPath) {
      setLicenseDocName(cached.licenseDocName || fileNameFromPath(cached.licenseDocPath));
      setLicenseDocPath(cached.licenseDocPath || null);
    }
    if (cached?.licenseDocDataUrl) setLicenseDocDataUrl(cached.licenseDocDataUrl);

    const cachedGallery = Array.isArray(cached?.galleryDataUrls) ? cached.galleryDataUrls : [];
    const imageList = Array.isArray(data.images)
      ? data.images
      : Array.isArray(cached?.galleryPaths)
        ? cached.galleryPaths
        : null;

    if (imageList || cachedGallery.length) {
      const pathList = imageList
        ? imageList
          .map((img) => (typeof img === 'string' ? img : img?.url || img?.path || ''))
          .filter(Boolean)
        : cachedGallery.map((g) => g.path).filter(Boolean);

      const byPath = new Map();
      const byBase = new Map();
      cachedGallery.forEach((g) => {
        if (!g || !(g.dataUrl || g.url)) return;
        const val = g.dataUrl || g.url;
        if (g.path) {
          byPath.set(g.path, val);
          byBase.set(fileNameFromPath(g.path), val);
        }
      });

      // Only keep images we can actually render (data URLs).
      // Remote /uploads paths currently 404 and were showing as empty "default" tiles.
      const serverItems = pathList
        .map((path, idx) => {
          const base = fileNameFromPath(path);
          const dataUrl =
            byPath.get(path) ||
            byBase.get(base) ||
            cachedGallery[idx]?.dataUrl ||
            null;
          if (!dataUrl) return null;
          return { url: dataUrl, path, dataUrl, isNew: false, broken: false };
        })
        .filter(Boolean);

      const items =
        serverItems.length > 0
          ? serverItems
          : cachedGallery
            .map((g) =>
              g?.dataUrl
                ? {
                  url: g.dataUrl,
                  path: g.path || 'gallery',
                  dataUrl: g.dataUrl,
                  isNew: false,
                  broken: false
                }
                : null
            )
            .filter(Boolean);

      setGallery((prev) => {
        // After save / soft refresh: keep working local/data-URL previews
        if (
          keepLocalPreviews &&
          prev.length &&
          prev.some((g) => isLocalPreview(g.url) || g.dataUrl)
        ) {
          return prev.map((g) => ({
            ...g,
            isNew: false,
            file: undefined,
            url: g.dataUrl || g.url
          }));
        }
        const localNew = keepLocalPreviews ? prev.filter((g) => g.isNew && g.file) : [];
        const paths = new Set(items.map((s) => s.path));
        const extrasLocal = localNew.filter((g) => !paths.has(g.path));
        return [...items, ...extrasLocal];
      });
    }

    return {
      bannerPath: coverPath || cached?.bannerPath || null,
      logoPath: logoPath || cached?.logoPath || null,
      bannerDataUrl: cached?.bannerDataUrl || null,
      logoDataUrl: cached?.logoDataUrl || null,
      tinCertName: data.tinCertificate
        ? fileNameFromPath(data.tinCertificate)
        : cached?.tinCertName || '',
      tinCertPath: data.tinCertificate || cached?.tinCertPath || null,
      tinCertDataUrl: cached?.tinCertDataUrl || null,
      licenseDocName: data.licenseDocument
        ? fileNameFromPath(data.licenseDocument)
        : cached?.licenseDocName || '',
      licenseDocPath: data.licenseDocument || cached?.licenseDocPath || null,
      licenseDocDataUrl: cached?.licenseDocDataUrl || null,
      galleryPaths: imageList
        ? imageList
          .map((img) => (typeof img === 'string' ? img : img?.url || img?.path || ''))
          .filter(Boolean)
        : cached?.galleryPaths || [],
      galleryDataUrls: cached?.galleryDataUrls || []
    };
  };

  const fetchProfile = async ({ soft = false } = {}) => {
    if (!soft) setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authorization token not found. Please login again.');
        return;
      }

      const cached = loadCache();

      // Show cached profile immediately on hard refresh so fields never appear erased
      if (!soft && cached?.profile) {
        const warm = mapProfileData({}, { ...EMPTY_PROFILE, ...cached.profile });
        setProfile(warm);
        applyMediaFromData({}, { cached });
        setLoading(false);
      }

      const response = await fetch(URLS.GetProfile, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const result = await response.json().catch(() => ({}));

      if (response.status === 401) {
        setError(result?.message || 'Authorization token not found. Please login again.');
        return;
      }

      if (!response.ok || result.success === false) {
        // Keep cache visible if GET fails
        if (!cached?.profile) {
          setError(result?.message || 'Failed to load restaurant profile.');
        }
        return;
      }

      const data = extractProfilePayload(result);
      const basePrevious = {
        ...EMPTY_PROFILE,
        ...(cached?.profile || {}),
        ...profileRef.current
      };

      const nextProfile = mapProfileData(data, basePrevious);
      setProfile(nextProfile);

      const mediaMeta = applyMediaFromData(data, {
        keepLocalPreviews: soft,
        cached
      });

      // Always rewrite cache so the next browser refresh keeps values
      persistSnapshot(nextProfile, mediaMeta);

      if (!soft) {
        setBannerFile(null);
        setLogoFile(null);
        setTinCertFile(null);
        setLicenseDocFile(null);
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
      const cached = loadCache();
      if (cached?.profile) {
        setProfile((prev) => mapProfileData({}, { ...cached.profile, ...prev }));
        applyMediaFromData({}, { cached });
      } else {
        setError('Unable to connect to the server. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchBankDetails = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) return;

      const response = await fetch(
        URLS.GetBankDetails,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === false) {
        console.error(
          'Failed to fetch bank details:',
          result.message
        );
        return;
      }

      const bank = result.bankDetails || {};

      setProfile((prev) => {
        const updatedProfile = {
          ...prev,
          accountNumber: bank.accountNumber || '',
          accountHolderName: bank.accountHolderName || '',
          bankName: bank.bankName || '',
          ifscCode: bank.ifscCode || '',
          branchName: bank.branchName || '',
        };

        // Update cache without removing existing profile/media data
        const cached = loadCache() || {};

        saveCache({
          ...cached,
          profile: updatedProfile,
        });

        return updatedProfile;
      });

    } catch (err) {
      console.error('Fetch bank details error:', err);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchBankDetails();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    try {
      const dataUrl = await fileToDataUrl(file);
      setBannerUrl(dataUrl || URL.createObjectURL(file));
    } catch {
      setBannerUrl(URL.createObjectURL(file));
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    try {
      const dataUrl = await fileToDataUrl(file);
      setLogoUrl(dataUrl || URL.createObjectURL(file));
    } catch {
      setLogoUrl(URL.createObjectURL(file));
    }
  };

  const handleTinCertUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setTinCertFile(file);
    setTinCertName(file.name);
    setTinCertPath(file.name);
    try {
      const dataUrl = await fileToDataUrl(file);
      setTinCertDataUrl(dataUrl);
    } catch {
      setTinCertDataUrl(URL.createObjectURL(file));
    }
  };

  const handleLicenseDocUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLicenseDocFile(file);
    setLicenseDocName(file.name);
    setLicenseDocPath(file.name);
    try {
      const dataUrl = await fileToDataUrl(file);
      setLicenseDocDataUrl(dataUrl);
    } catch {
      setLicenseDocDataUrl(URL.createObjectURL(file));
    }
  };

  const handleAddGallery = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const items = await Promise.all(
      files.map(async (file) => {
        let dataUrl = null;
        try {
          dataUrl = await fileToDataUrl(file);
        } catch {
          dataUrl = null;
        }
        return {
          url: dataUrl || URL.createObjectURL(file),
          dataUrl,
          path: file.name,
          isNew: true,
          file,
          broken: false
        };
      })
    );
    setGallery((prev) => [...prev, ...items]);
    e.target.value = '';
  };

  const removeGalleryImage = (idx) => {
    setGallery((prev) => prev.filter((_, i) => i !== idx));
  };

  const markGalleryBroken = (idx) => {
    // Drop tiles that fail to load — do not show empty/default placeholders
    setGallery((prev) => {
      const item = prev[idx];
      if (!item) return prev;
      if (item.dataUrl && item.url !== item.dataUrl) {
        return prev.map((g, i) =>
          i === idx ? { ...g, url: g.dataUrl, broken: false } : g
        );
      }
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);

    const snapshot = { ...profileRef.current };

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authorization token not found. Please login again.');
        return;
      }

      if (!snapshot.restaurantName?.trim()) {
        setError('Restaurant Name is required.');
        return;
      }

      const formData = new FormData();
      const appendIf = (key, value) => {
        const v = value == null ? '' : String(value).trim();
        if (v !== '') formData.append(key, v);
      };

      // Exact Postman field names
      appendIf('restaurentName', snapshot.restaurantName);
      appendIf('phone', snapshot.contactNumber);
      appendIf('address', snapshot.address);
      appendIf('dailyOpenTime', snapshot.dailyOpenTime);
      appendIf('dailyCloseTime', snapshot.dailyClosedTime);
      appendIf('Taxpayer Identification No 1', snapshot.taxpayerId1);
      appendIf('Taxpayer Identification No 2', snapshot.taxpayerId2);
      appendIf('tinNumber', snapshot.tinNumber);
      appendIf('tinNumberTwo', snapshot.tinNumberTwo);
      appendIf('tinExpiryDate', snapshot.tinExpiryDate);
      appendIf('tinnumberTwoDate', snapshot.tinExpiryTwoDate);
      appendIf('ownerName', snapshot.principalOwnerName);
      appendIf('ownerPhone', snapshot.ownerDirectNumber);
      appendIf('platformCommission', snapshot.platformCommission);
      appendIf('estimatedDeliveryTime', snapshot.estimatedDeliveryTime);

      if (logoFile) formData.append('restaurentLogo', logoFile);
      if (bannerFile) formData.append('restaurentCover', bannerFile);
      if (tinCertFile) formData.append('tinCertificate', tinCertFile);
      if (licenseDocFile) formData.append('licenseDocument', licenseDocFile);

      gallery
        .filter((g) => g.isNew && g.file)
        .forEach((g) => formData.append('images', g.file));

      const res = await fetch(URLS.UpdateProfile, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const result = await res.json().catch(() => null);

      if (!res.ok || result?.success === false || result?.status === false) {
        setError(parseApiError(result, `Failed to update restaurant profile (${res.status}).`));
        return;
      }

      // Update Restaurant Bank Details
      const bankResponse = await fetch(
        URLS.UpdateBankDetails,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            accountNumber: snapshot.accountNumber,
            accountHolderName: snapshot.accountHolderName,
            bankName: snapshot.bankName,
            ifscCode: snapshot.ifscCode,
            branchName: snapshot.branchName,
          }),
        }
      );

      const bankResult = await bankResponse.json().catch(() => ({}));

      if (!bankResponse.ok || bankResult.success === false) {
        setError(
          bankResult.message || 'Failed to update bank details.'
        );
        return;
      }

      // Update bank fields from API response
      const updatedBank = bankResult.bankDetails || {};

      Object.assign(snapshot, {
        accountNumber: updatedBank.accountNumber ?? snapshot.accountNumber,
        accountHolderName: updatedBank.accountHolderName ?? snapshot.accountHolderName,
        bankName: updatedBank.bankName ?? snapshot.bankName,
        ifscCode: updatedBank.ifscCode ?? snapshot.ifscCode,
        branchName: updatedBank.branchName ?? snapshot.branchName,
      });

      const apiData = extractProfilePayload(result);
      const nextProfile = mapProfileData(apiData, snapshot);
      setProfile(nextProfile);

      // Convert uploaded files to lasting data URLs (survive refresh; server static may 404)
      const [logoDataUrl, bannerDataUrl] = await Promise.all([
        logoFile ? fileToDataUrl(logoFile) : Promise.resolve(null),
        bannerFile ? fileToDataUrl(bannerFile) : Promise.resolve(null)
      ]);

      const prevCache = loadCache() || {};
      const finalLogoDataUrl =
        logoDataUrl ||
        (isLocalPreview(logoUrl) ? logoUrl : null) ||
        prevCache.logoDataUrl ||
        null;
      const finalBannerDataUrl =
        bannerDataUrl ||
        (isLocalPreview(bannerUrl) ? bannerUrl : null) ||
        prevCache.bannerDataUrl ||
        null;

      // Keep showing what the user just uploaded
      if (finalLogoDataUrl) setLogoUrl(finalLogoDataUrl);
      if (finalBannerDataUrl) setBannerUrl(finalBannerDataUrl);

      const mediaMeta = applyMediaFromData(apiData, {
        keepLocalPreviews: true,
        cached: {
          ...prevCache,
          logoDataUrl: finalLogoDataUrl,
          bannerDataUrl: finalBannerDataUrl
        }
      });

      // Build gallery cache: existing cached + newly uploaded data URLs
      const existingGalleryCache = Array.isArray(prevCache.galleryDataUrls)
        ? prevCache.galleryDataUrls
        : [];
      const uploadedGallery = await Promise.all(
        gallery
          .filter((g) => g.isNew && g.file)
          .map(async (g) => ({
            path: g.path,
            dataUrl: g.dataUrl || (await fileToDataUrl(g.file))
          }))
      );
      const galleryDataUrls = [
        ...existingGalleryCache.filter((g) => g?.dataUrl),
        ...uploadedGallery.filter((g) => g?.dataUrl)
      ];

      // Prefer server paths from response when present
      const galleryPaths = Array.isArray(apiData.images)
        ? apiData.images.map((img) => (typeof img === 'string' ? img : img?.url || img?.path || '')).filter(Boolean)
        : mediaMeta.galleryPaths || prevCache.galleryPaths || [];

      // Pair server paths with data URLs where possible (new uploads append at end)
      const pairedGallery = galleryPaths.map((path, idx) => ({
        path,
        dataUrl:
          galleryDataUrls[idx]?.dataUrl ||
          existingGalleryCache.find((g) => g.path === path)?.dataUrl ||
          null
      }));
      // Keep any brand-new local previews not yet reflected in API images list
      uploadedGallery.forEach((g) => {
        if (g.dataUrl && !pairedGallery.some((p) => p.dataUrl === g.dataUrl)) {
          pairedGallery.push(g);
        }
      });

      setGallery((prev) => {
        const fromPair = pairedGallery
          .filter((g) => g.dataUrl || getImageUrl(g.path))
          .map((g) => ({
            url: g.dataUrl || getImageUrl(g.path),
            dataUrl: g.dataUrl || null,
            path: g.path,
            isNew: false,
            broken: false
          }));
        return fromPair.length ? fromPair : prev.map((g) => ({ ...g, isNew: false, file: undefined }));
      });

      const [nextTinDataUrl, nextLicenseDataUrl] = await Promise.all([
        tinCertFile ? fileToDataUrl(tinCertFile) : Promise.resolve(tinCertDataUrl),
        licenseDocFile ? fileToDataUrl(licenseDocFile) : Promise.resolve(licenseDocDataUrl)
      ]);
      if (nextTinDataUrl) setTinCertDataUrl(nextTinDataUrl);
      if (nextLicenseDataUrl) setLicenseDocDataUrl(nextLicenseDataUrl);
      if (apiData.tinCertificate) {
        setTinCertPath(apiData.tinCertificate);
        setTinCertName(fileNameFromPath(apiData.tinCertificate));
      }
      if (apiData.licenseDocument) {
        setLicenseDocPath(apiData.licenseDocument);
        setLicenseDocName(fileNameFromPath(apiData.licenseDocument));
      }

      persistSnapshot(nextProfile, {
        ...mediaMeta,
        bannerPath: apiData.restaurentCover || mediaMeta.bannerPath,
        logoPath: apiData.restaurentLogo || mediaMeta.logoPath,
        bannerDataUrl: finalBannerDataUrl,
        logoDataUrl: finalLogoDataUrl,
        galleryPaths,
        galleryDataUrls: pairedGallery.filter((g) => g.dataUrl),
        tinCertName: tinCertName || mediaMeta.tinCertName,
        tinCertPath: apiData.tinCertificate || tinCertPath || mediaMeta.tinCertPath,
        tinCertDataUrl: nextTinDataUrl || tinCertDataUrl || mediaMeta.tinCertDataUrl,
        licenseDocName: licenseDocName || mediaMeta.licenseDocName,
        licenseDocPath: apiData.licenseDocument || licenseDocPath || mediaMeta.licenseDocPath,
        licenseDocDataUrl: nextLicenseDataUrl || licenseDocDataUrl || mediaMeta.licenseDocDataUrl
      });

      setBannerFile(null);
      setLogoFile(null);
      setTinCertFile(null);
      setLicenseDocFile(null);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);

      // Soft GET — keepLocalPreviews so data URLs are not replaced by 404 server URLs
      await fetchProfile({ soft: true });
    } catch (err) {
      console.error('Profile update error:', err);
      setError('Unable to save profile. Please check your connection.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          width: '100%',
          maxWidth: 1200,
          margin: '0 auto',
          padding: '60px 0',
          textAlign: 'center',
          color: 'var(--text-muted)'
        }}
      >
        <RefreshCw size={28} className="fp-spinner" style={{ margin: '0 auto 12px' }} />
        <p style={{ margin: 0, fontSize: 14 }}>Loading restaurant profile…</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Store size={22} color="var(--primary)" /> Restaurant Profile
          </h1>
          <p className="page-desc">
            Manage your store identity, operating hours, delivery parameters, tax compliance, and ownership details
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => { fetchProfile(); fetchBankDetails(); }}
            disabled={loading || saving}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
          <button type="button" onClick={handleSubmit} disabled={saving} className="btn btn-primary">
            {saving ? <RefreshCw size={16} className="fp-spinner" /> : <Save size={16} />}
            <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </div>

      {saved && (
        <div
          className="card"
          style={{
            background: 'var(--success-bg)',
            border: '1px solid #a7f3d0',
            color: 'var(--success)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: 14,
            marginBottom: 20
          }}
        >
          <CheckCircle size={20} /> Restaurant profile details updated successfully!
        </div>
      )}

      {error && (
        <div
          className="card"
          style={{
            background: 'var(--danger-bg)',
            border: '1px solid #fecaca',
            color: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: 14,
            marginBottom: 20
          }}
        >
          <AlertCircle size={20} /> {error}
        </div>
      )}

      <div className="card" style={{ marginBottom: 24, padding: 0, overflow: 'hidden' }}>
        <div style={{ position: 'relative', width: '100%', height: 230, background: '#1e293b' }}>
          {bannerUrl ? (
            <img
              src={bannerUrl}
              alt="Cover"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={() => {
                const cachedBanner = loadCache()?.bannerDataUrl;
                if (cachedBanner && bannerUrl !== cachedBanner) setBannerUrl(cachedBanner);
                else if (!isLocalPreview(bannerUrl)) setBannerUrl(null);
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'grid',
                placeItems: 'center',
                color: 'rgba(255,255,255,0.55)',
                fontSize: 13
              }}
            >
              No cover image — click Change Cover to upload
            </div>
          )}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(15, 23, 42, 0.75) 0%, rgba(15, 23, 42, 0.1) 60%)',
              pointerEvents: 'none'
            }}
          />
          <label
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'rgba(15, 23, 42, 0.85)',
              color: '#fff',
              padding: '8px 14px',
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Camera size={14} /> Change Cover
            <input type="file" accept="image/*" onChange={handleBannerUpload} style={{ display: 'none' }} />
          </label>
        </div>

        <div style={{ padding: '0 24px 24px', marginTop: -46, position: 'relative' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18 }}>
              <div style={{ position: 'relative' }}>
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo"
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: 20,
                      objectFit: 'cover',
                      border: '4px solid #fff',
                      boxShadow: '0 6px 18px rgba(0,0,0,0.18)',
                      background: '#fff'
                    }}
                    onError={() => {
                      const cachedLogo = loadCache()?.logoDataUrl;
                      if (cachedLogo && logoUrl !== cachedLogo) setLogoUrl(cachedLogo);
                      else if (!isLocalPreview(logoUrl)) setLogoUrl(null);
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: 20,
                      border: '4px solid #fff',
                      background: '#e2e8f0',
                      display: 'grid',
                      placeItems: 'center',
                      color: 'var(--text-muted)',
                      fontSize: 11,
                      textAlign: 'center',
                      padding: 8
                    }}
                  >
                    Upload logo
                  </div>
                )}
                <label
                  style={{
                    position: 'absolute',
                    bottom: 4,
                    right: 4,
                    background: 'var(--primary)',
                    color: '#fff',
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <Camera size={14} />
                  <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                </label>
              </div>

              <div style={{ paddingBottom: 6 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  {profile.restaurantName || '—'}
                </h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                  {[profile.address, profile.contactNumber].filter(Boolean).join(' • ') || '—'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', paddingBottom: 6 }}>
              <div
                style={{
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: '8px 14px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Delivery Time
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--primary)', marginTop: 2 }}>
                  {profile.estimatedDeliveryTime || '—'}
                </div>
              </div>
              <div
                style={{
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: '8px 14px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Commission
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-main)', marginTop: 2 }}>
                  {profile.platformCommission !== '' ? `${profile.platformCommission}%` : '—'}
                </div>
              </div>
              <div
                style={{
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: '8px 14px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Hours
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-main)', marginTop: 2 }}>
                  {profile.dailyOpenTime || profile.dailyClosedTime
                    ? `${profile.dailyOpenTime || '—'} - ${profile.dailyClosedTime || '—'}`
                    : '—'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Store size={18} color="var(--primary)" /> Restaurant & Operational Parameters
          </h2>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Restaurant Name</label>
              <input
                className="form-input"
                name="restaurantName"
                value={profile.restaurantName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Number (phone)</label>
              <input
                className="form-input"
                name="contactNumber"
                value={profile.contactNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Daily Open Time</label>
              <input
                className="form-input"
                name="dailyOpenTime"
                value={profile.dailyOpenTime}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Daily Close Time</label>
              <input
                className="form-input"
                name="dailyClosedTime"
                value={profile.dailyClosedTime}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Platform Commission (%)</label>
              <input
                className="form-input"
                name="platformCommission"
                value={profile.platformCommission}
                onChange={handleChange}
                placeholder="e.g. 15"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Estimated Delivery Time</label>
              <input
                className="form-input"
                name="estimatedDeliveryTime"
                value={profile.estimatedDeliveryTime}
                onChange={handleChange}
                placeholder="e.g. 45min"
              />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Address</label>
              <input
                className="form-input"
                name="address"
                value={profile.address}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="card-title" style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={18} color="var(--primary)" /> Ownership & Regulatory Details
          </h2>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Owner Name</label>
              <input
                className="form-input"
                name="principalOwnerName"
                value={profile.principalOwnerName}
                onChange={handleChange}
                placeholder="Owner name"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Owner Phone</label>
              <input
                className="form-input"
                name="ownerDirectNumber"
                value={profile.ownerDirectNumber}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Taxpayer Identification No 1</label>
              <input
                className="form-input"
                name="taxpayerId1"
                value={profile.taxpayerId1}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Taxpayer Identification No 2</label>
              <input
                className="form-input"
                name="taxpayerId2"
                value={profile.taxpayerId2}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">TIN Number</label>
              <input
                className="form-input"
                name="tinNumber"
                value={profile.tinNumber}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">TIN Number Two</label>
              <input
                className="form-input"
                name="tinNumberTwo"
                value={profile.tinNumberTwo}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">TIN Expiry Date</label>
              <input
                className="form-input"
                name="tinExpiryDate"
                value={profile.tinExpiryDate}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">TIN Two Expiry Date</label>
              <input
                className="form-input"
                name="tinExpiryTwoDate"
                value={profile.tinExpiryTwoDate}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">TIN Certificate</label>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Upload size={14} /> Upload
                  <input type="file" accept="image/*,.pdf" onChange={handleTinCertUpload} style={{ display: 'none' }} />
                </label>
                <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{tinCertName || 'No file'}</span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">License Document</label>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Upload size={14} /> Upload
                  <input type="file" accept="image/*,.pdf" onChange={handleLicenseDocUpload} style={{ display: 'none' }} />
                </label>
                <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{licenseDocName || 'No file'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="card-title" style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Landmark size={18} color="var(--primary)" /> Bank Details
          </h2>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Account Number</label>
              <input
                className="form-input"
                name="accountNumber"
                value={profile.accountNumber}
                onChange={handleChange}
                placeholder='Enter A/c Number'
              />
            </div>
            <div className="form-group">
              <label className="form-label">Account Holder Name</label>
              <input
                className="form-input"
                name="accountHolderName"
                value={profile.accountHolderName}
                onChange={handleChange}
                placeholder='Enter A/c Holder Name'
              />
            </div>
            <div className="form-group">
              <label className="form-label">Bank Name</label>
              <input
                className="form-input"
                name="bankName"
                value={profile.bankName}
                onChange={handleChange}
                placeholder='Enter Bank Name'
              />
            </div>
            <div className="form-group">
              <label className="form-label">IFSC Code</label>
              <input
                className="form-input"
                name="ifscCode"
                value={profile.ifscCode}
                onChange={handleChange}
                placeholder='Enter IFSC Code'
              />
            </div>
            <div className="form-group">
              <label className="form-label">Branch Name</label>
              <input
                className="form-input"
                name="branchName"
                value={profile.branchName}
                onChange={handleChange}
                placeholder='Enter Branch Name'
              />
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={18} color="var(--primary)" /> Additional Gallery Images
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                Upload gallery images for your restaurant
              </p>
            </div>
            <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
              <Upload size={13} /> Add Gallery Image
              <input type="file" accept="image/*" multiple onChange={handleAddGallery} style={{ display: 'none' }} />
            </label>
          </div>

          {gallery.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '30px 20px',
                color: 'var(--text-muted)',
                border: '1px dashed var(--border)',
                borderRadius: 12
              }}
            >
              <Image size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: 13 }}>
                No gallery images yet. Click &ldquo;Add Gallery Image&rdquo; to upload.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 14 }}>
              {gallery.map((item, i) => (
                <div
                  key={`${item.path}-${i}`}
                  style={{
                    position: 'relative',
                    borderRadius: 12,
                    overflow: 'hidden',
                    height: 110,
                    border: '1px solid var(--border)',
                    background: '#f1f5f9'
                  }}
                >
                  <img
                    src={item.dataUrl || item.url}
                    alt={fileNameFromPath(item.path) || `Gallery ${i + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={() => markGalleryBroken(i)}
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(i)}
                    title="Remove"
                    style={{
                      position: 'absolute',
                      top: 6,
                      right: 6,
                      background: 'rgba(239, 68, 68, 0.9)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      width: 24,
                      height: 24,
                      display: 'grid',
                      placeItems: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 28, display: 'flex', gap: 12 }}>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? <RefreshCw size={16} className="fp-spinner" /> : <Save size={16} />}
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
