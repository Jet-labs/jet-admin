import React, { useState } from "react";
import {
  Plus,
  Settings,
  Store,
  Search,
  MoreVertical,
  PauseCircle,
  Info,
  LayoutGrid,
  List,
  Eye,
  PlayCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { TenantLogo } from "./tenantLogo";
import moment from "moment";
import PropTypes from "prop-types";
import {
  Button,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Spinner,
} from "@jet-admin/ui";

export const TenantStats = ({ tenants }) => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active' | 'disabled'
  const [sortBy, setSortBy] = useState("name"); // 'name' | 'date'
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'

  if (!tenants) {
    return (
      <div className="flex justify-center items-center h-full w-full bg-background">
        <Spinner size={24} className="text-primary" />
      </div>
    );
  }

  const handleTenantClick = (tenantID) => {
    navigate(CONSTANTS.ROUTES.VIEW_TENANT.path(tenantID));
  };

  const handleAddTenant = () => {
    navigate(CONSTANTS.ROUTES.ADD_TENANT.path());
  };

  // Filtering
  const filtered = tenants.filter((tenant) => {
    const matchesSearch = tenant.tenantTitle
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "disabled" && tenant.isDisabled) ||
      (statusFilter === "active" && !tenant.isDisabled);

    return matchesSearch && matchesStatus;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "name") {
      return a.tenantTitle.localeCompare(b.tenantTitle);
    } else {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  return (
    <div className="bg-background text-foreground h-full w-full overflow-y-auto px-8 py-8 flex flex-col justify-start">
      {/* Title */}
      <div className="mb-6 flex flex-col">
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">
          {CONSTANTS.STRINGS.TENANTS_STATS_TITLE}
        </h1>
        <p className="text-xs text-muted-foreground">
          Manage your application workspaces and databases.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full mb-6">
        {/* Left Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60 z-10" />
            <Input
              type="text"
              size="sm"
              placeholder="Search for a project"
              className="pl-8 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status Dropdown */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger size="sm" className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="disabled">Disabled</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger size="sm" className="w-44">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Sorted by name</SelectItem>
              <SelectItem value="date">Sorted by date</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* View Toggles */}
          <div className="flex items-center bg-muted/50 gap-1 h-8">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              square
              className="h-7 w-7"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              square
              className="h-7 w-7"
            >
              <List className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* New Project Button */}
          <Button
            onClick={handleAddTenant}
            // variant="green"
            size="sm"
            className="text-foreground"
          >
            <Plus className="h-4 w-4" />
            <span>{CONSTANTS.STRINGS.TENANTS_STATS_ADD_TENANT_BUTTON}</span>
          </Button>
        </div>
      </div>

      {/* Grid or List View */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-border rounded-lg bg-muted/30">
          <p className="text-muted-foreground text-sm">No projects found</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((tenant) => (
            <div
              key={tenant.tenantID}
              onClick={() => handleTenantClick(tenant.tenantID)}
              className="group relative bg-card border border-border hover:border-border/80 rounded-md p-3 flex flex-col justify-between  cursor-pointer transition-all duration-200"
            >
              {/* Card Top Section */}
              <div className="flex justify-between items-start w-full">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-sm border border-border bg-muted/50 flex justify-center items-center overflow-hidden">
                    {tenant.tenantLogoURL ? (
                      <TenantLogo
                        src={tenant.tenantLogoURL}
                        alt="Tenant Logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Store className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                      {tenant.tenantTitle}
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Created: {moment(tenant.createdAt).format("MMM Do YY")}
                    </p>
                  </div>
                </div>

                {/* Card Actions Menu */}
                <div className="relative card-menu-container">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        square
                        onClick={(e) => e.stopPropagation()}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(
                            CONSTANTS.ROUTES.UPDATE_TENANT.path(tenant.tenantID)
                          );
                        }}
                      >
                        <Settings className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTenantClick(tenant.tenantID);
                        }}
                      >
                        <Eye className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                        <span>View</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Card Bottom Section */}
              <div className="mt-4">
                {tenant.isDisabled ? (
                  <span className="inline-flex items-center gap-1.5 bg-muted/50 text-muted-foreground text-xs font-medium  rounded-full">
                    <PauseCircle className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Project is paused</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-muted/50 text-muted-foreground text-xs font-medium  rounded-full">
                    <PlayCircle className="h-3.5 w-3.5 text-primary" />
                    <span>Project is active</span>
                  </span>
                )}
              </div>
            </div>
          ))}
          </div>
        ) : (
          /* List View */
          <div className="flex flex-col gap-2">
            {sorted.map((tenant) => (
              <div
                key={tenant.tenantID}
                onClick={() => handleTenantClick(tenant.tenantID)}
                className="group relative bg-card border border-border hover:border-border/80 rounded-md p-4 flex items-center justify-between cursor-pointer transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-sm border border-border bg-muted/50 flex justify-center items-center overflow-hidden">
                    {tenant.tenantLogoURL ? (
                      <TenantLogo
                        src={tenant.tenantLogoURL}
                        alt="Tenant Logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Store className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                      {tenant.tenantTitle}
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Created: {moment(tenant.createdAt).format("MMM Do YY")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {tenant.isDisabled ? (
                    <span className="inline-flex items-center gap-1 bg-muted/50 text-muted-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                      <PauseCircle className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Project is paused</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center bg-primary text-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}

                  {/* Actions Menu */}
                  <div className="relative card-menu-container">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          square
                          onClick={(e) => e.stopPropagation()}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(
                              CONSTANTS.ROUTES.UPDATE_TENANT.path(tenant.tenantID)
                            );
                          }}
                        >
                          <Settings className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                          <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTenantClick(tenant.tenantID);
                          }}
                        >
                          <Eye className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                          <span>View</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
            </div>
      )}
    </div>
  );
};

TenantStats.propTypes = {
  tenants: PropTypes.array.isRequired,
};