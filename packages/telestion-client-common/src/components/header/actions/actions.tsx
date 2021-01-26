import { ReactElement } from 'react';
import PropTypes from 'prop-types';
import { Flex } from '@adobe/react-spectrum';

export interface ActionsProps {
	children: ReactElement | ReactElement[];
}

export function Actions({ children }: ActionsProps) {
	return (
		<Flex direction="row" gap="size-50">
			{children}
		</Flex>
	);
}

Actions.propTypes = {
	children: PropTypes.node.isRequired
};