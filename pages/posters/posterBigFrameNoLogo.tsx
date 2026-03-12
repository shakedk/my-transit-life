import React from "react";
import PosterLayout from "../../components/posters/PosterLayout";
import PrintExportButtons from "../../components/posters/PrintExportButtons";
import { getPosterServerSideProps } from "../../src/lib/posters/utils";
import styles from "./posterBigFrameNoLogo.module.css";

export const getServerSideProps = (context: { query: Record<string, string | string[] | undefined> }) =>
  getPosterServerSideProps(context, "PosterBigFrameNoLogo");

export default function Page(props: {
  routeData?: { routeData?: string } | Record<string, unknown>;
  routeDesignConfig?: { routeData?: string } | Record<string, unknown>;
  isInEditMode?: boolean;
  isPrintMode?: boolean;
  stopDataFromDB?: Record<string, unknown>;
  posterID?: string | null;
  displayedPatternsFromDB?: Record<string, { toDisplay?: boolean }>;
}) {
  const routeData =
    props.routeData?.routeData != null
      ? JSON.parse((props.routeData as { routeData: string }).routeData)
      : props.routeData;
  const routeDesignConfig =
    props.routeDesignConfig?.routeData != null
      ? JSON.parse((props.routeDesignConfig as { routeData: string }).routeData)
      : props.routeDesignConfig;
  if (!routeData || !routeDesignConfig) return null;

  return (
    <>
      <PosterLayout
        routeData={routeData}
        routeDesignConfig={routeDesignConfig}
        isInEditMode={props.isInEditMode ?? false}
        isPrintMode={props.isPrintMode ?? false}
        stopDataFromDB={props.stopDataFromDB ?? {}}
        posterID={props.posterID ?? null}
        displayedPatternsFromDB={props.displayedPatternsFromDB ?? {}}
        layout="posterBigFrameNoLogo"
        styles={styles}
      />
      <PrintExportButtons />
    </>
  );
}
