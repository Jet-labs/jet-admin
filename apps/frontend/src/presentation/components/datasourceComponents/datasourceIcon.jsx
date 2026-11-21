import PropTypes from "prop-types";
import React from "react";
import { DiMsqlServer } from "react-icons/di";
import {
  SiAirtable,
  SiAmazons3,
  SiApachekafka,
  SiClickhouse,
  SiCockroachlabs,
  SiDuckdb,
  SiElasticsearch,
  SiFirebase,
  SiGithub,
  SiGitlab,
  SiGoogleanalytics,
  SiGooglebigquery,
  SiGooglesheets,
  SiGraphql,
  SiInfluxdb,
  SiJira,
  SiMongodb,
  SiMysql,
  SiNeo4J,
  SiNotion,
  SiOracle,
  SiPostgresql,
  SiPrometheus,
  SiRabbitmq,
  SiRedis,
  SiSendgrid,
  SiSlack,
  SiSqlite,
  SiStripe,
  SiSupabase,
  SiTwilio
} from "react-icons/si";
import { FaFileExcel } from "react-icons/fa";
import { TbApi, TbDatabase, TbFolder, TbMail, TbServer, TbUsers, TbWorldWww } from "react-icons/tb";

/**
 * Icon mapping from string identifiers to React components
 */
const ICON_MAP = {
  SiPostgresql,
  SiMysql,
  SiMongodb,
  SiFirebase,
  SiGooglesheets,
  SiGraphql,
  SiRabbitmq,
  SiApachekafka,
  FaFileExcel,
  SiRedis,
  SiMicrosoftsqlserver: DiMsqlServer,
  SiSupabase,
  SiGooglebigquery,
  SiAirtable,
  SiAmazons3,
  SiElasticsearch,
  SiStripe,
  SiOracle,
  SiSqlite,
  SiCockroachlabs,
  SiNeo4j: SiNeo4J,
  SiTwilio,
  SiSendgrid,
  SiSlack,
  SiNotion,
  SiJira,
  SiGoogleanalytics,
  SiClickhouse,
  SiDuckdb,
  SiPrometheus,
  SiInfluxdb,
  SiGithub,
  SiGitlab,
  TbApi,
  TbWorldWww,
  TbDatabase,
  TbFolder,
  TbServer,
  TbMail,
  TbUsers,
};

/**
 * DatasourceIcon - Renders the appropriate icon for a datasource type
 * 
 * @param {string} icon - The icon identifier from DATASOURCE_TYPES
 * @param {string} iconColor - The brand color for the icon
 * @param {number} size - Icon size in pixels
 * @param {string} className - Additional CSS classes
 */
export const DatasourceIcon = ({ icon, iconColor, size = 18, className = "" }) => {
  DatasourceIcon.propTypes = {
    icon: PropTypes.string,
    iconColor: PropTypes.string,
    size: PropTypes.number,
    className: PropTypes.string,
  };

  const IconComponent = ICON_MAP[icon] || TbDatabase;

  return (
    <IconComponent
      size={size}
      style={{ color: iconColor }}
      className={className}
    />
  );
};

/**
 * Get icon component by datasource type value
 * @param {string} datasourceType - The datasource type value
 * @returns {React.ComponentType} The icon component
 */
export const getDatasourceIconByType = (datasourceType, datasourceConfig) => {
  if (!datasourceConfig) return TbDatabase;
  return ICON_MAP[datasourceConfig.icon] || TbDatabase;
};

export default DatasourceIcon;
