import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { ImageIcon, Upload } from "lucide-react";

import { Button } from "../../../components/ui/button";
import {
  ASSET_RULES,
  uploadSiteAsset,
  type AssetKind,
} from "../../../redux/apis/apisTenantSiteAdmin";
import { toTenancyError } from "../../../redux/apis/apisTenancyAdmin";

/**
 * Upload an image, then hand its `objectKey` to the caller to save.
 *
 * The upload endpoint stores the file but **writes nothing to the site** — an
 * admin who uploads a logo and navigates away has changed nothing. So this
 * shows the new file as unsaved until the surrounding form is submitted, and
 * the caller is responsible for putting the key in its payload.
 *
 * Size and type are checked here as well as server-side, so a 4 MB logo fails
 * instantly rather than after the whole upload.
 */

/**
 * Object storage can be switched off for a whole environment, and when it is,
 * every upload on the screen fails the same way. That is a property of the
 * deployment rather than of one field, so the first refusal disables all of
 * them at once — otherwise an admin collects one toast per control while
 * working out that nothing here can work.
 *
 * Module-scoped rather than React state: the upload controls are spread across
 * branding and every section card, and threading a flag from the page through
 * both panels would be a prop that exists only for an environment almost
 * nobody runs.
 */
let storageUnavailable = false;
const storageListeners = new Set<() => void>();

const markStorageUnavailable = () => {
  storageUnavailable = true;
  storageListeners.forEach((notify) => notify());
};

const useStorageUnavailable = (): boolean => {
  const [off, setOff] = useState(storageUnavailable);
  useEffect(() => {
    const notify = () => setOff(storageUnavailable);
    storageListeners.add(notify);
    notify();
    return () => {
      storageListeners.delete(notify);
    };
  }, []);
  return off;
};
const AssetField = ({
  kind,
  label,
  objectKey,
  url,
  dirty,
  onUploaded,
  onCleared,
  disabled,
}: {
  kind: AssetKind;
  label: string;
  objectKey: string | null;
  /** The address to preview: from the last GET, or from this session's upload. */
  url: string | null;
  /** True when the key differs from what the server holds. */
  dirty?: boolean;
  onUploaded: (asset: { objectKey: string; url: string }) => void;
  onCleared: () => void;
  disabled?: boolean;
}) => {
  const rules = ASSET_RULES[kind];
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const storageOff = useStorageUnavailable();

  const pick = (file: File | undefined) => {
    if (!file) return;

    if (file.size > rules.maxBytes) {
      // The limit, not the file name — an admin needs to know what would work.
      toast.error(`That file is too large. ${label} accepts ${rules.label}.`);
      return;
    }

    setBusy(true);
    uploadSiteAsset(kind, file)
      .then((asset) => {
        onUploaded({ objectKey: asset.objectKey, url: asset.url });
        toast.success("Uploaded. Save to apply it to your site.");
      })
      .catch((error) => {
        const failure = toTenancyError(error, "Could not upload that file.");
        if (failure.code === "TENANCY.SITE.ASSET_REJECTED") {
          // Never blame the extension: the server reads the file's own leading
          // bytes, so "rename it" is bad advice. Name what works instead.
          toast.error(`That file type isn't accepted. ${label} accepts ${rules.label}.`);
        } else if (failure.code === "TENANCY.SITE.ASSET_TOO_LARGE") {
          toast.error(`That file is too large. ${label} accepts ${rules.label}.`);
        } else if (failure.code === "TENANCY.SITE.ASSET_STORAGE_UNAVAILABLE") {
          markStorageUnavailable();
          toast.error("Image uploads aren't available in this environment.");
        } else {
          toast.error(failure.message);
        }
      })
      .finally(() => {
        setBusy(false);
        if (input.current) input.current.value = "";
      });
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-xs font-semibold text-foreground">{label}</label>
        <span className="text-[11px] text-muted-foreground">{rules.label}</span>
      </div>

      <div className="flex items-center gap-3 rounded-[2px] border border-[var(--surface-border)] p-2.5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[2px] bg-muted">
          {url ? (
            <img src={url} alt="" className="h-full w-full object-contain" />
          ) : (
            <ImageIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-muted-foreground">
            {storageOff
              ? "Image uploads are unavailable here"
              : objectKey
                ? "Image set"
                : "No image yet"}
          </p>
          {dirty && (
            <p className="text-[11px] font-semibold text-[var(--color-warning,#b45309)]">
              Not saved yet — press Save branding.
            </p>
          )}
        </div>

        <input
          ref={input}
          type="file"
          className="hidden"
          // SVG is deliberately absent — it can carry script, and these files
          // are served from the platform's origin to the tenant's customers.
          accept={rules.accept.join(",")}
          onChange={(event) => pick(event.target.files?.[0])}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || busy || storageOff}
          onClick={() => input.current?.click()}
        >
          <Upload className="mr-1.5 h-3.5 w-3.5" />
          {busy ? "Uploading…" : "Upload"}
        </Button>
        {objectKey && (
          <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={onCleared}>
            Remove
          </Button>
        )}
      </div>
    </div>
  );
};

export default AssetField;
