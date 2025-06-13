import { Grid, Icon } from "@raycast/api";

function GridLoadingView({ title }: { title: string }) {
  return (
    <Grid isLoading={true} navigationTitle="please wait...">
      <Grid.EmptyView icon={Icon.CircleProgress} title={title} />
    </Grid>
  );
}

export default GridLoadingView;
