import * as React from "react";
import {getTheme} from "../../../AppTheme";
import {Table} from "semantic-ui-react";
import {RoverRuckusRank, TeamIdentifier} from "@the-orange-alliance/lib-ems";

interface IProps {
  rankings: RoverRuckusRank[],
  identifier?: TeamIdentifier
}

class FRC20RankTable extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props);
  }

  public render() {
    const {rankings, identifier} = this.props;
    const rankingsView = rankings.map((ranking) => {
      const displayName = typeof ranking.team !== undefined ? ranking.team.getFromIdentifier(identifier) : ranking.teamKey;
      return (
        <Table.Row key={ranking.rankKey}>
          <Table.Cell>{ranking.rank}</Table.Cell>
          <Table.Cell>{displayName}</Table.Cell>
          <Table.Cell>{ranking.rankingPoints}</Table.Cell>
          <Table.Cell>{ranking.tiebreakerPoints}</Table.Cell>
          <Table.Cell>{ranking.highScore}</Table.Cell>
          <Table.Cell>{ranking.played}</Table.Cell>
        </Table.Row>
      );
    });
    return (
      <Table color={getTheme().secondary} attached={true} celled={true} textAlign="center" columns={16}>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell width={1}>Rank</Table.HeaderCell>
            <Table.HeaderCell width={1}>Team #</Table.HeaderCell>
            <Table.HeaderCell>Ranking Points</Table.HeaderCell>
            <Table.HeaderCell>Tiebreaker Points</Table.HeaderCell>
            <Table.HeaderCell>High Score</Table.HeaderCell>
            <Table.HeaderCell>Matches Played</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rankingsView}
        </Table.Body>
      </Table>
    );
  }
}

export default FRC20RankTable;
